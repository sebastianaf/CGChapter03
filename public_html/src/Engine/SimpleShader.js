/* 
 * File: SimpleShader.js
 * 
 * Implements a SimpleShader object.
 * 
 */

/*jslint node: true, vars: true */
/*global gEngine: false, alert: false, XMLHttpRequest: false, alert: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

//<editor-fold desc="constructor">
// constructor of SimpleShader object
function SimpleShader(vertexShaderPath, fragmentShaderPath) {
    // instance variables
    // Convention: all instance variables: mVariables
    this.mCompiledShader = null;  // reference to the compiled shader in webgl context  
    this.mShaderVertexPositionAttribute = null; // reference to SquareVertexPosition within the shader
    this.mPixelColor = null;                    // reference to the pixelColor uniform in the fragment shader
    this.mModelTransform = null;                // reference to model transform matrix in vertex shader
    this.mViewProjTransform = null;             // reference to the View/Projection matrix in the vertex shader

    var gl = gEngine.Core.getGL();

    // start of constructor code
    // 
    // Step A: load and compile vertex and fragment shaders
    var vertexShader = this._loadAndCompileShader(vertexShaderPath, gl.VERTEX_SHADER);
    var fragmentShader = this._loadAndCompileShader(fragmentShaderPath, gl.FRAGMENT_SHADER);

    // Step B: Create and link the shaders into a program.
    this.mCompiledShader = gl.createProgram();
    gl.attachShader(this.mCompiledShader, vertexShader);
    gl.attachShader(this.mCompiledShader, fragmentShader);
    gl.linkProgram(this.mCompiledShader);

    // Step C: check for error
    if (!gl.getProgramParameter(this.mCompiledShader, gl.LINK_STATUS)) {
        alert("Error linking shader");
        return null;
    }

    // Step D: Gets a reference to the aSquareVertexPosition attribute within the shaders.
    this.mShaderVertexPositionAttribute = gl.getAttribLocation(
        this.mCompiledShader, "aSquareVertexPosition");

    // Step E: Activates the vertex buffer loaded in EngineCore_VertexBuffer.js
    gl.bindBuffer(gl.ARRAY_BUFFER, gEngine.VertexBuffer.getGLVertexRef());

    // Step F: Describe the characteristic of the vertex position attribute
    gl.vertexAttribPointer(this.mShaderVertexPositionAttribute,
        3,              // each element is a 3-float (x,y.z)
        gl.FLOAT,       // data type is FLOAT
        false,          // if the content is normalized vectors
        0,              // number of bytes to skip in between elements
        0);             // offsets to the first element

    // Step G: Gets references to the uniform variables: uPixelColor, uModelTransform, and uViewProjTransform
    this.mPixelColor = gl.getUniformLocation(this.mCompiledShader, "uPixelColor");
    this.mModelTransform = gl.getUniformLocation(this.mCompiledShader, "uModelTransform");
    this.mViewProjTransform = gl.getUniformLocation(this.mCompiledShader, "uViewProjTransform");
}
//</editor-fold>

// <editor-fold desc="Public Methods">


// Access to the compiled shader
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

// Activate the shader for rendering
SimpleShader.prototype.activateShader = function (pixelColor, vpMatrix) {
    var gl = gEngine.Core.getGL();
    gl.useProgram(this.mCompiledShader);
    gl.uniformMatrix4fv(this.mViewProjTransform, false, vpMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, gEngine.VertexBuffer.getGLVertexRef());
    gl.vertexAttribPointer(this.mShaderVertexPositionAttribute,
        3,              // each element is a 3-float (x,y.z)
        gl.FLOAT,       // data type is FLOAT
        false,          // if the content is normalized vectors
        0,              // number of bytes to skip in between elements
        0);             // offsets to the first element
    gl.enableVertexAttribArray(this.mShaderVertexPositionAttribute);
    gl.uniform4fv(this.mPixelColor, pixelColor);
};
// Loads per-object model transform to the vertex shader
SimpleShader.prototype.loadObjectTransform = function (modelTransform) {
    var gl = gEngine.Core.getGL();
        // loads the modelTransform matrix into webGL to be used by the vertex shader
    gl.uniformMatrix4fv(this.mModelTransform, false, modelTransform);
};

//-- end of public methods
// </editor-fold>

// <editor-fold desc="Private Methods">
//**-----------------------------------
// Private methods not mean to call by outside of this object
//    naming convention: starts with an "_"
// **------------------------------------

// 
// Returns a compiled shader from a shader in the dom.
// The id is the id of the script in the html tag.
SimpleShader.prototype._loadAndCompileShader = function (filePath, shaderType) {
    var gl = gEngine.Core.getGL();
    var xmlReq, shaderSource = null, compiledShader = null;

    // Step A: Request the text from the given file location.
    xmlReq = new XMLHttpRequest();
    xmlReq.open('GET', filePath, false);
    try {
        xmlReq.send();
    } catch (error) {
        alert("Failed to load shader: " + filePath + " [Hint: you cannot double click index.html to run this project. " +
                "The index.html file must be loaded by a web-server.]");
        return null;
    }
    shaderSource = xmlReq.responseText;

    if (shaderSource === null) {
        alert("WARNING: Loading of:" + filePath + " Failed!");
        return null;
    }

    // Step B: Create the shader based on the shader type: vertex or fragment
    compiledShader = gl.createShader(shaderType);

    // Step C: Compile the created shader
    gl.shaderSource(compiledShader, shaderSource);
    gl.compileShader(compiledShader);

    // Step D: check for errors and return results (null if error)
    // The log info is how shader compilation errors are typically displayed.
    // This is useful for debugging the shaders.
    if (!gl.getShaderParameter(compiledShader, gl.COMPILE_STATUS)) {
        alert("A shader compiling error occurred: " + gl.getShaderInfoLog(compiledShader));
    }

    return compiledShader;
};
//-- end of private methods
//</editor-fold>