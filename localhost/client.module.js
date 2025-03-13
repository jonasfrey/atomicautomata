
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"


import {

    f_o_webgl_program,
    f_delete_o_webgl_program,
    f_resize_canvas_from_o_webgl_program,
    f_render_from_o_webgl_program, 
    f_o_html_element__from_s_tag,
    f_o_proxified_and_add_listeners, 
    f_o_html_from_o_js,
    f_v_from_path_dotnotation
} from "https://deno.land/x/handyhelpers@5.1.95/mod.js"


import {
    f_s_hms__from_n_ts_ms_utc,
} from "https://deno.land/x/date_functions@2.0.0/mod.js"  

let a_o_shader = []
let n_idx_a_o_shader = 0;
let o_state_ufloc = {}
let a_o_automata = [
    {
        s_name: 'zero_black', 
        s_glsl: `n_new = 0.0;`,
        a_s_variable: []
    },
    {
        s_name: 'one_white', 
        s_glsl: `n_new = 1.0;`,
        a_s_variable: []
    },
    {
        s_name: 'n_nor_krnl_channel', 
        s_glsl: `n_new = n_nor_krnl_channel;`,
    },
    {
        s_name: 'abs', 
        s_glsl: `n_new = abs(n_nor_krnl);`,
        a_s_variable: []
    },
    {
        s_name: '0',
        s_glsl: `

            if(n_nor_krnl > n_1 || n_nor_krnl < n_2){
                n_new = n_last-n_nor_krnl;
            }else{
                n_new = n_last+n_nor_krnl;
            }
        `, 
        n_1: 0.1, 
        n_2: 0.5, 
        a_s_variable: ['n_1', 'n_2'], 
    },
    {
        s_name: 'n_last_plus_constant',
        s_glsl: `

            if(n_nor_krnl < n_1){
                n_new = n_last + n_3;
            }
            if(n_nor_krnl > n_2){
                n_new = n_last - n_3;
            }
        `, 
        n_1: 0.2, 
        n_2: 0.6, 
        n_3: 0.1
    },
    {
        s_name: 'Threshold Invert',
        s_glsl: `
            if(n_nor_krnl > n_1) {
                n_new = 1.0 - n_last;
            } else {
                n_new = n_nor_krnl;
            }
        `,
        n_1: 0.5,
    },
    {
        s_name: 'Damped Oscillator',
        s_glsl: `
            n_new = n_last * n_1 + n_nor_krnl * (1.0 - n_1);
        `,
        n_1: 0.5,
    },
    {
        s_name: "conway's Game of life", 
        s_glsl: `
            if (n_krnl_sum_floored_channel == 3. || n_krnl_sum_floored_channel == 11. || n_krnl_sum_floored_channel == 12.){
                n_new = 1.;

            }else{
                n_new = 0.;
            }
        `,
        o_krnl: [
            1,1,1,
            1,9,1,
            1,1,1
        ]
    },
    {
        s_name: "wolframs rule 3d", 
        s_glsl: `
        if (
            n_krnl_sum_floored_channel == 1.
             || n_krnl_sum_floored_channel == 2.
             || n_krnl_sum_floored_channel == 3.
             || n_krnl_sum_floored_channel == 4.
            ){
                n_new = 1.;
            }else{
                n_new = 0.;
            }
          `,
          o_krnl: [
            0,0,0,
            0,0,0,
            1,2,4
          ]
    },
    {
        s_name: "inverse gaussian worms", 
        s_glsl: `
        float x = n_nor_krnl_channel;
        n_new = -1./pow(2., (n_1*pow(x, 2.)))+1.;
        `,
        o_krnl: [
            0.68,-0.9,0.68,
            -0.9,-.66,-0.9, 
            0.68,-.9,0.68
        ], 
        n_1: 0.6
    },
    {
        s_name: "inverse gaussian worms - multichannel", 
        s_glsl: `
        float x = n_nor_krnl;
        n_new = -1./pow(2., (n_1*pow(x, 2.)))+1.;
        `,
        o_krnl: [
            0.68,-0.9,0.68,
            -0.9,-.66,-0.9, 
            0.68,-.9,0.68
        ], 
        n_1: 0.6
    },
    {
        s_name: 'waves', 
        s_glsl: `
        float x = n_nor_krnl_channel;
        n_new = abs(n_1*x);
        `, 
        o_krnl: [
            0.565, -0.716, 0.565,
            -0.716,0.627,-0.716,
            0.565, -0.716, 0.565
        ], 
        n_1: 1.2
    },
    {
        s_name: 'waves_multichannel', 
        s_glsl: `
        float x = n_nor_krnl;
        n_new = abs((1.+n_1)*x*n_2);
        `, 
        o_krnl: [
            0.565, -0.716, 0.565,
            -0.716,0.627,-0.716,
            0.565, -0.716, 0.565
        ], 
        n_1: 0.2, 
        n_2: 1.0

    },
    {
        s_name: 'noname_multichannel', 
        s_glsl: `
        float x = n_nor_krnl;
        n_new = n_2/pow(2.001, (pow(x, 2.0)))+n_1;
        `, 
        o_krnl: [
            -0.999,0.928,-0.999,
            0.928,0.1,0.928,
            -0.999,0.928,-0.999,
        ], 
        n_1: 1.001, 
        n_2: -1.0

    },
    {
        s_name: 'fabric', 
        s_glsl: '', 
        o_krnl: [
        ],
    },
    {
        s_name: 'Edge Pulse',
        s_glsl: `
            if(n_nor_krnl > n_1 || n_nor_krnl < n_2) {
                n_new = 1.0 - n_last;
            } else {
                n_new = 0.0;
            }
        `,
        n_1: 0.1, 
        n_2: 0.8,
    },
    {
        s_name: 'Modulo Wave',
        s_glsl: `
            float n_mod = mod((n_last * n_1) + (n_nor_krnl * n_2), 1.0);
            n_new = abs(sin(n_mod * 3.14159265 * 2.0));
        `,
        n_1: 0.5, 
        n_2: 0.5
    },
    {
        s_name: 'Threshold Blend',
        s_glsl: `
            float n_diff = abs(n_nor_krnl - n_last);
            n_new = mix(n_last, n_nor_krnl, smoothstep(n_2, n_1, n_diff));
        `,
        n_1: 0.2, 
        n_2: 0.8
    },
    {
        s_name: 'Weighted Growth & Decay rule',
        s_glsl: `
            // Weighted Growth & Decay rule
            if (n_nor_krnl > n_1) {  
                n_new = n_last + (n_nor_krnl - n_last) * n_2; // Move toward neighborhood average  
            } else if (n_nor_krnl < n_1) {  
                n_new = n_last - (n_last - n_nor_krnl) * n_2; // Move away from neighborhood average  
            } else {  
                n_new = n_last;  
            }
        `,
        n_1: 0.2, 
        n_2: 0.8 
    },
    {
        s_name: 'Pattern Stabilization (Thresholded Growth)',
        s_glsl: `
            // Pattern Stabilization (Thresholded Growth)
            if (n_nor_krnl > n_1 && n_last < 0.5) {  
                n_new = min(n_last + n_2, 1.0); // Increase brightness  
            } else if (n_nor_krnl < n_1 && n_last > 0.5) {  
                n_new = max(n_last - n_2, 0.0); // Decrease brightness  
            } else {  
                n_new = n_last;  
            }
        `,
        n_1: 0.2, 
        n_2: 0.2 
    },
    {
        s_name: 'Reaction-Diffusion-Like Behavior',
        s_glsl: `
        // Reaction-Diffusion-Like Behavior
        n_new = n_last + (n_nor_krnl - n_last) * n_1 - (n_last * (1.0 - n_last) * n_2);
        `, 
        n_1: 0.8, 
        n_2: 1.2
    },
    {
        s_name: 'Noise-Driven Chaos',
        s_glsl: `
        // Noise-Driven Chaos
        float rand_val = fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453); // GLSL random
        if (abs(n_nor_krnl - n_last) > n_1) {
            n_new = clamp(n_last + (rand_val * 2.0 - 1.0) * n_2, 0.0, 1.0); // Small random fluctuations
        } else {
            n_new = n_last;
        }
        `,
        n_1: 0.5, 
        n_2: 0.9,
    },
    {
        s_name: 'Conditional Cellular Flow', 
        s_glsl: `
        // Conditional Cellular Flow
        if (n_last > n_1) {  
            n_new = mix(n_nor_krnl, n_last, n_2); // Bias toward neighborhood if above n_1  
        } else {  
            n_new = mix(n_last, n_nor_krnl, n_2); // Bias toward self if below n_1  
        }
        `, 
        n_1: 0.5, 
        n_2: 0.9
    },
    // {
    //     s_name: "", 
    //     s_glsl: `
    //         asdf
    //     `, 
    //     a_s_variable: ['n_1', 'n_2'], 
    // }

]

let f_resize_o_texture_krnl = function(s_channel){
    // const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    let o_scl = o_state[`o_scl_krnl_${s_channel}`]
    let n_len = o_scl[0]*o_scl[1]*4;
    let a_n_u8_krnl_old = o_texture_data[`o_texture_krnl_${s_channel}`];
    if(a_n_u8_krnl_old.length != n_len){
        o_texture_data[`o_texture_krnl_${s_channel}`] = new Uint8Array(n_len); 
    }
    let o_canvas = document.querySelector(`.krnl_canvas.${s_channel}`);
    for(let n = 0; n<n_len;n+=1){
        let n_trn_x = (n/4)%o_state[`o_scl_krnl_${s_channel}`][0];
        let n_trn_y = parseInt(n/4)/o_state[`o_scl_krnl_${s_channel}`][1];
        let n_c = 255//parseInt(Math.random()*255);
        let n_value_old = a_n_u8_krnl_old[n_trn_x*4+n_trn_y*4];
        if(n_value_old){
            n_c = n_value_old;
        }
        o_texture_data[`o_texture_krnl_${s_channel}`][n] = n_c
    }
    // const level = 0;
    // const internalFormat = o_webgl_program?.o_ctx.RGBA;
    // const width = o_state[`o_scl_krnl_${s_channel}`][0];
    // const height = o_state[`o_scl_krnl_${s_channel}`][1];
    // const border = 0;
    // const srcFormat = o_webgl_program?.o_ctx.RGBA;
    // const srcType = o_webgl_program?.o_ctx.UNSIGNED_BYTE;
    // // let s_channel = s_path.split('_').pop();
    
    // o_webgl_program?.o_ctx.texImage2D(
    //     o_webgl_program?.o_ctx.TEXTURE_2D,
    //     level,
    //     internalFormat,
    //     width,
    //     height,
    //     border,
    //     srcFormat,
    //     srcType,
    //     o_texture_data[`o_texture_krnl_${s_channel}`],
    // );

}
let f_update_canvas_with_krnl_data = function(s_channel, o_doc = document){
    let a_n_u8_image_data = o_texture_data[`o_texture_krnl_${s_channel}`]
    // console.log(a_n_u8_image_data)
    globalThis.a_n_u8_image_data = a_n_u8_image_data
    let n_scl_x = o_state[`o_scl_krnl_${s_channel}`][0];
    let n_scl_y = o_state[`o_scl_krnl_${s_channel}`][1];
    for(let n = 0; n<a_n_u8_image_data.length/4; n+=1){
        a_n_u8_image_data[n*4+3] = 255
    }
    const o_image_data = new ImageData(
        new Uint8ClampedArray(a_n_u8_image_data), // Convert to Uint8ClampedArray
        n_scl_x,
        n_scl_y
    );
    let o_canvas_krnl = o_krnl_canvases[`o_krnl_canvas_${s_channel}`];
    const o_ctx2d = o_krnl_canvases[`o_krnl_canvas_ctx_${s_channel}`];
    
    o_canvas_krnl.width = n_scl_x;
    o_canvas_krnl.height = n_scl_y;

    o_ctx2d.putImageData(o_image_data, 0, 0);
         
}
globalThis.f_update_canvas_with_krnl_data = f_update_canvas_with_krnl_data

let a_s_rule = [
    ...a_o_automata.map(o=>{
        return o.s_name
    })
]
function f_b_numeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
let f_try_to_update_ufloc = function(
    s_path,
    v_new
){
    let o_ufloc = o_state_ufloc[s_path];
    if(!o_ufloc && f_b_numeric(s_path.split('.').at(-1))){
        let s_path_array = s_path.split('.').slice(0, -1).join('.')
        o_ufloc = o_state_ufloc[s_path_array];
        // console.log(s_path_array)
        v_new = f_v_from_path_dotnotation(s_path_array, o_state);
        // console.log(v_new);
    }

    o_webgl_program.o_ctx.useProgram(o_webgl_program.o_shader__program);

    if(o_ufloc){
        if(v_new === true){
            v_new = 1.;
        }
        if(v_new === false){
            v_new = 0.;
        }
        
        if (typeof v_new === 'number') {
            o_webgl_program?.o_ctx.uniform1f( 
                o_ufloc,
                v_new
            );
        }
        if (v_new?.length == 2) {
            o_webgl_program?.o_ctx.uniform2f( 
                o_ufloc,
                v_new[0],v_new[1] 
            );
        }
        if (v_new?.length == 3) {
            o_webgl_program?.o_ctx.uniform3f( 
                o_ufloc,
                v_new[0],v_new[1],v_new[2]
            );
        }
        if (v_new?.length == 4) {
            o_webgl_program?.o_ctx.uniform4f( 
                o_ufloc,
                v_new[0],v_new[1],v_new[2],v_new[3]
            );
        }
        // if (v_new?.length > 4) {
        //     debugger;
        //     const level = 0;
        //     const internalFormat = o_webgl_program?.o_ctx.RGBA;
        //     const width = 1;
        //     const height = 1;
        //     const border = 0;
        //     const srcFormat = o_webgl_program?.o_ctx.RGBA;
        //     const srcType = o_webgl_program?.o_ctx.UNSIGNED_BYTE;
        //     // let s_channel = s_path.split('_').pop();
            
        //     o_webgl_program?.o_ctx.texImage2D(
        //       o_webgl_program?.o_ctx.TEXTURE_2D,
        //       level,
        //       internalFormat,
        //       width,
        //       height,
        //       border,
        //       srcFormat,
        //       srcType,
        //       v_new,
        //     );

        // }

    }
}

let s_shader_vertex_downsample =`attribute vec4 a_position;
varying vec2 v_texCoord;

void main() {
    gl_Position = a_position;
    v_texCoord = a_position.xy * 0.5 + 0.5; // Convert from clip space to texture coordinates
}
`
let s_shader_fragment_downsample = `precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;

void main() {
    vec2 texelSize = 1.0 / u_textureSize;
    vec4 color = vec4(0.0);

    // Simple box filter for downsampling
    for (float x = -1.0; x <= 1.0; x++) {
        for (float y = -1.0; y <= 1.0; y++) {
            color += texture2D(u_texture, v_texCoord + vec2(x, y) * texelSize);
        }
    }

    gl_FragColor = color / 9.0; // Average the samples
}`

function createDisplayShaderProgram(gl) {
    const vertexShaderSource = `
        attribute vec4 a_position;
        varying vec2 v_texCoord;

        void main() {
            gl_Position = a_position;
            v_texCoord = a_position.xy * 0.5 + 0.5;
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;

        void main() {
            vec4 o_col = texture2D(u_texture, v_texCoord);
            gl_FragColor = o_col;
        }
    `;

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the display shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

function createDownsampleShaderProgram(gl) {
    // Vertex shader source code
    const vertexShaderSource = `
        attribute vec4 a_position;
        varying vec2 v_texCoord;

        void main() {
            gl_Position = a_position;
            v_texCoord = a_position.xy * 0.5 + 0.5; // Convert from clip space to texture coordinates
        }
    `;

    // Fragment shader source code
    const fragmentShaderSource = `precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec2 u_textureSize; // Size of the original texture
    
    uniform float n_b_invert;
    uniform float n_b_mirror_vertical;
    uniform float n_b_mirror_horizontal;
    uniform float n_b_mirror_diagonal;
    
    void main() {
        vec2 texelSize = 1.0 / u_textureSize;
        vec2 modifiedTexCoord = v_texCoord;
    
        // Apply reflection/mirroring based on the boolean flags
        if (n_b_mirror_vertical == 1.0) {
            // Reflect on y-axis (vertical symmetry)
            modifiedTexCoord.x = abs(modifiedTexCoord.x - 0.5) * 2.0;
        }
        if (n_b_mirror_horizontal == 1.0) {
            // Reflect on x-axis (horizontal symmetry)
            modifiedTexCoord.y = abs(modifiedTexCoord.y - 0.5) * 2.0;
        }
        if (n_b_mirror_diagonal == 1.0) {
            // Mirror on diagonal axis (swap and reflect)
            modifiedTexCoord.xy = abs(modifiedTexCoord.yx - 0.5) * 2.0;
        }
        vec4 color = vec4(0.0);
        color = texture2D(u_texture, modifiedTexCoord  * texelSize);
    
        // Simple box filter for downsampling
        // for (int x = -1; x <= 1; x++) {
        //     for (int y = -1; y <= 1; y++) {
        //         color += texture2D(u_texture, modifiedTexCoord + vec2(x, y) * texelSize);
        //     }
        // }
    
        // vec4 o_col = color / 9.0;
        vec4 o_col = color;
    
        if (n_b_invert == 1.0) {
            o_col.rgb = 1.0 - o_col.rgb; // Invert colors
        }
    
        gl_FragColor = o_col; // Output the final color
    }
    `;

    // Compile the vertex shader
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    if (!vertexShader) {
        console.error('Failed to compile vertex shader');
        return null;
    }

    // Compile the fragment shader
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
        console.error('Failed to compile fragment shader');
        return null;
    }

    // Create the shader program
    const downsampleShaderProgram = gl.createProgram();
    gl.attachShader(downsampleShaderProgram, vertexShader);
    gl.attachShader(downsampleShaderProgram, fragmentShader);
    gl.linkProgram(downsampleShaderProgram);

    // Check if the program linked successfully
    if (!gl.getProgramParameter(downsampleShaderProgram, gl.LINK_STATUS)) {
        console.error('Failed to link shader program: ' + gl.getProgramInfoLog(downsampleShaderProgram));
        return null;
    }

    return downsampleShaderProgram;
}

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}


let o_texture_data = {
    o_texture_krnl_red : new Uint8Array(new Array(3*3*4).fill(0).map((n)=>{
        return parseInt(Math.random()*255)
    })),
    o_texture_krnl_green : new Uint8Array(new Array(3*3*4).fill(0).map((n)=>{
        return parseInt(Math.random()*255)
    })),
    o_texture_krnl_blue : new Uint8Array(new Array(3*3*4).fill(0).map((n)=>{
        return parseInt(Math.random()*255)
    }))
}
let o_krnl_canvases = {
    o_krnl_canvas_red: null,
    o_krnl_canvas_ctx_red: null,
    o_krnl_canvas_green: null,
    o_krnl_cacanvas_ctxreen: null,
    o_krnl_canvas_blue: null,
    o_krnl_ccanvas_ctxblue: null,
}
globalThis.o_texture_data = o_texture_data
let o_media_recorder = null;
let o_state = f_o_proxified_and_add_listeners(
    {
        b_ctrl_down: false,
        o_trn_mouse : [],
        n_b_normalize_krnl_red: false,
        n_b_normalize_krnl_green: false,
        n_b_normalize_krnl_blue: false,
        n_b_last_frame_as_krnl_red: false,
        n_b_last_frame_as_krnl_green: false,
        n_b_last_frame_as_krnl_blue: false,
        n_b_invert_krnl_red: false,
        n_b_invert_krnl_green: false,
        n_b_invert_krnl_blue: false,
        n_b_mirror_vertical_red: false,
        n_b_mirror_vertical_green: false,
        n_b_mirror_vertical_blue: false,
        n_b_mirror_horizontal_red: false,
        n_b_mirror_horizontal_green: false,
        n_b_mirror_horizontal_blue: false,
        n_b_mirror_diagonal_red: false,
        n_b_mirror_diagonal_green: false,
        n_b_mirror_diagonal_blue: false,
        o_scl_krnl_red: [3,3],
        o_scl_krnl_green:[3,3],
        o_scl_krnl_blue:[3,3],
        a_s_channel: ['red', 'green', 'blue'],
        n_b_mouse_down_left: false, 
        n_b_mouse_down_middle: false, 
        n_b_mouse_down_right: false, 
        a_o_automata,
        o_automata_red: a_o_automata.find(o=>o.s_name == 'n_nor_krnl'),
        o_automata_green: a_o_automata[0],
        o_automata_blue: a_o_automata[0],
        a_s_rule,
        s_rule_red: a_s_rule[0],
        s_rule_green: a_s_rule[0],
        s_rule_blue: a_s_rule[0],
        n_idx_s_rule_red: a_o_automata.indexOf(a_o_automata.find(o=>o.s_name == 'n_nor_krnl')),
        n_idx_s_rule_green: 0,
        n_idx_s_rule_blue: 0,
        b_show_inputs: true,
        b_recording: false,
        n_1_red: 0.5, 
        n_2_red: 0.005, 
        n_3_red: 0.05, 
        n_1_green: 0.5, 
        n_2_green: 0.005, 
        n_3_green: 0.005, 
        n_1_blue: 0.5, 
        n_2_blue: 0.005, 
        n_3_blue: 0.005, 
        n_fps: 30,
        n_factor_resolution: 1.0,
        o_shader: {},
        o_state_notifire: {},
        n_idx_a_o_shader,
        a_o_shader,
        n_number: 23,
    },
    ()=>{},
    (a_s_path, v_old, v_new) => {
        let s_path = a_s_path.join('.');
        f_try_to_update_ufloc(s_path, v_new)
    }
)
globalThis.o_state = o_state

o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        cursor:url(./cursor.cur), auto;
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center;
        align-items:flex-start;
    }
    canvas{
        width: 100%;
        height: 100%;
        position:fixed;
        z-index:-1;
        image-rendering: pixelated;
    }
    #o_el_time{
        margin:1rem;
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
    }
    input{
        width:100%
    }
    label{
        background:rgba(0,0,0,0.8);
        padding: 0.2rem;
        color: #ddd;
    }
    input[type='range'] {
        -webkit-appearance: none;
        width: 100%;
        height: 25px;
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
        -webkit-transition: .2s;
        transition: opacity .2s;
      }
      
      input[type='range']:hover {
        opacity: 1;
      }
      
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        background: #04AA6D;
        cursor: pointer;
      }
      
      input[type='range']::-moz-range-thumb {
        width: 25px;
        height: 25px;
        background: #04AA6D;
        cursor: pointer;
      }

      input[type="number"] {
        width: 10%;
        flex: 0 0 auto; /* Ensure the number input takes only as much space as it needs */
      }
      
    //   input[type="range"] {
    //     flex: 1 1 auto; /* Allow the range input to grow and take up remaining space */
    //   }
    hr{
        display: block
    }
        /* Chrome, Safari, Edge, Opera */
    input.disable_arrows::-webkit-outer-spin-button,
    input.disable_arrows::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    /* Firefox */
    input.disable_arrows[type=number] {
    -moz-appearance: textfield;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    .krnl_canvas{
        position:relative; 
        width:200px;
        height:200px;
        z-index:1;
    }
    `
);


let o_webgl_program = null;

// it is our job to create or get the cavas
let o_canvas = document.createElement('canvas'); // or document.querySelector("#my_canvas");
// just for the demo 
// o_canvas.style.position = 'fixed';
// o_canvas.style.width = '100vw';
// o_canvas.style.height = '100vh';
o_webgl_program = f_o_webgl_program(
    o_canvas,
    `#version 300 es
    in vec4 a_o_vec_position_vertex;
    void main() {
        gl_Position = a_o_vec_position_vertex;
    }`, 
    `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    uniform vec2 o_scl_canvas;
    uniform float n_ms_time;
    uniform sampler2D o_texture_last_frame;
    // uniform sampler2D o_texture_last_frame_downsampled;
    uniform sampler2D o_texture_krnl_red;
    uniform sampler2D o_texture_krnl_green;
    uniform sampler2D o_texture_krnl_blue;
    uniform vec2 o_scl_krnl_red;
    uniform vec2 o_scl_krnl_green;
    uniform vec2 o_scl_krnl_blue;

    uniform float n_1_red;
    uniform float n_2_red;
    uniform float n_3_red;
    uniform float n_1_green;
    uniform float n_2_green;
    uniform float n_3_green;
    uniform float n_1_blue;
    uniform float n_2_blue;
    uniform float n_3_blue;
    uniform float n_idx_s_rule_red;
    uniform float n_idx_s_rule_green;
    uniform float n_idx_s_rule_blue;
    uniform float n_b_mouse_down_left;
    uniform float n_b_mouse_down_middle;
    uniform float n_b_mouse_down_right;
    uniform float n_b_normalize_krnl_red;
    uniform float n_b_normalize_krnl_green;
    uniform float n_b_normalize_krnl_blue;

    uniform vec2 o_trn_mouse;

    vec2 g( vec2 n ) { return sin(n.x*n.y*vec2(12,17)+vec2(1,2)); }
    //vec2 g( vec2 n ) { return sin(n.x*n.y+vec2(0,1.571)); } // if you want the gradients to lay on a circle
    float hashOld12(vec2 p)
    {
        // Two typical hashes...
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        
        // This one is better, but it still stretches out quite quickly...
        // But it's really quite bad on my Mac(!)
        //return fract(sin(dot(p, vec2(1.0,113.0)))*43758.5453123);
    
    }
    float noise(vec2 p)
    {
        const float kF = 2.0;  // make 6 to see worms
        
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f*f*(3.0-2.0*f);
        return mix(mix(sin(kF*dot(p,g(i+vec2(0,0)))),
                    sin(kF*dot(p,g(i+vec2(1,0)))),f.x),
                mix(sin(kF*dot(p,g(i+vec2(0,1)))),
                    sin(kF*dot(p,g(i+vec2(1,1)))),f.x),f.y);
    }

    float f_n_from_o_vec4(vec4 o_vec4){
        // Convert the RGBA values back to bytes (range [0, 255])
        vec4 bytes = o_vec4 * 255.0;

        // Reconstruct the float32 value
        float value = bytes.r * 256.0 * 256.0 * 256.0 +
                    bytes.g * 256.0 * 256.0 +
                    bytes.b * 256.0 +
                    bytes.a;

        // Normalize the value to the range [0, 1] (optional)
        value = value / (256.0 * 256.0 * 256.0 * 256.0);
        return value;
    }
    void main() {
        // gl_FragCoord is the current pixel coordinate and available by default
        float n_min_scl_canvas = min(o_scl_canvas.x, o_scl_canvas.y);
        vec2 o_trn_pix_nor = (gl_FragCoord.xy - o_scl_canvas.xy*.5) / vec2(n_min_scl_canvas);
        vec2 o_trn_mou_nor = (o_trn_mouse.xy - o_scl_canvas.xy*.5) / vec2(n_min_scl_canvas);
        vec2 o_trn_pix_nor2 = (o_trn_pix_nor+.5);
        o_trn_pix_nor2.y = 1.-o_trn_pix_nor2.y;
        float n1 = (o_trn_pix_nor.x*o_trn_pix_nor.y);
        float n2 = sin(length(o_trn_pix_nor)*3.);
        float n_t = n_ms_time *0.005;
        float n = sin(n_t*0.2)*n1 + 1.-cos(n_t*0.2)*n2; 
        // vec4 o_pixel_from_image_0 = texture(o_texture_0, o_trn_pix_nor2+vec2(0.009, -0.08));
        // vec4 o_pixel_from_image_1 = texture(o_texture_1, o_trn_pix_nor2+vec2(0.009, -0.08));
        vec4 o_last = texelFetch(o_texture_last_frame, ivec2(gl_FragCoord.xy), 0);
        if(n_ms_time < 1000.){
            fragColor = vec4(o_last.rgb, 1.0);
            return;
        }
    
        ivec2 texelCoord = ivec2(gl_FragCoord.xy); // Convert fragment coordinates to integer texel coordinates
    

        // Sum the values of the neighboring pixels (excluding the center pixel)
        vec3 o_sum = vec3(0.0);
        float n_count = 0.;
        vec2 o_scl_krnl = vec2(3.,3.);
        
        float n_scl_krnl_x_max = max(max(o_scl_krnl_green.x, o_scl_krnl_blue.x),o_scl_krnl_red.x);
        float n_scl_krnl_y_max = max(max(o_scl_krnl_green.y, o_scl_krnl_blue.y),o_scl_krnl_red.y);

        int n_scl_krnl_x_half = int(floor(n_scl_krnl_x_max/2.));
        int n_scl_krnl_y_half = int(floor(n_scl_krnl_y_max/2.));

        vec3 o_krnl_sum_floored = vec3(0.);
        for (int i = -n_scl_krnl_x_half; i <= n_scl_krnl_x_half; i++) {
            for (int j = -n_scl_krnl_y_half; j <= n_scl_krnl_y_half; j++) {
                ivec2 neighborCoord = texelCoord + ivec2(i, j);
                ivec2 on2 = ivec2(i, j)+ivec2(n_scl_krnl_x_half, n_scl_krnl_y_half);
                vec4 o_col_pixel_from_krnl = texelFetch(o_texture_last_frame, neighborCoord, 0);
                
                vec4 o_col_factor_from_krnl_red = (texelFetch(o_texture_krnl_red, on2, 0));
                float n_factor_from_krnl_red = f_n_from_o_vec4(o_col_factor_from_krnl_red);
                n_factor_from_krnl_red = (n_factor_from_krnl_red-.5)*2.;

                // n_factor_from_krnl_red = o_krnl_tmp[on2.x][on2.y];
                vec4 o_col_factor_from_krnl_green = (texelFetch(o_texture_krnl_green, on2, 0));
                float n_factor_from_krnl_green = f_n_from_o_vec4(o_col_factor_from_krnl_green);
                n_factor_from_krnl_green = (n_factor_from_krnl_green-.5)*2.;

                vec4 o_col_factor_from_krnl_blue = (texelFetch(o_texture_krnl_blue, on2, 0));
                float n_factor_from_krnl_blue = f_n_from_o_vec4(o_col_factor_from_krnl_blue);
                n_factor_from_krnl_blue = (n_factor_from_krnl_blue-.5)*2.;


                n_count+=1.;
                
                o_sum += vec3(
                    o_col_pixel_from_krnl.r*n_factor_from_krnl_red,
                    o_col_pixel_from_krnl.g*n_factor_from_krnl_green,
                    o_col_pixel_from_krnl.b*n_factor_from_krnl_blue
                );

                o_krnl_sum_floored += vec3(
                    int(((o_col_pixel_from_krnl.r > .5) ? 1.0 : 0.0)*n_factor_from_krnl_red),
                    int(((o_col_pixel_from_krnl.g > .5) ? 1.0 : 0.0)*n_factor_from_krnl_green),
                    int(((o_col_pixel_from_krnl.b > .5) ? 1.0 : 0.0)*n_factor_from_krnl_blue)
                );
            }
        }

        vec3 o_nor_krnl = o_sum;
        if(n_b_normalize_krnl_red == 1.){
            o_nor_krnl.r = o_nor_krnl.r / n_count;
        }
        if(n_b_normalize_krnl_green == 1.){
            o_nor_krnl.g = o_nor_krnl.g / n_count;
        }
        if(n_b_normalize_krnl_blue == 1.){
            o_nor_krnl.b = o_nor_krnl.b / n_count;
        }
        
        float n_last = o_last.r;
        
        float n_new_red = 0.0;
        float n_new_green = 0.0;
        float n_new_blue = 0.0;
        float n_new;
        float n_nor_krnl = (o_nor_krnl.r + o_nor_krnl.g + o_nor_krnl.b) / 3.;
        float n_nor_krnl_channel = 0.;
        float n_krnl_sum_floored_channel = 0.;
        ${o_state.a_s_channel.map((s_channel, n_idx_s_channel)=>{

            return a_o_automata.map((o, n_idx)=>{
                return `
                n_nor_krnl_channel = o_nor_krnl[${n_idx_s_channel}];
                //n_nor_krnl = o_nor_krnl[${n_idx_s_channel}];
                n_krnl_sum_floored_channel = o_krnl_sum_floored[${n_idx_s_channel}];
                if(n_idx_s_rule_${s_channel} == ${n_idx}.){
                    n_new = 0.;
                    float n_1 = n_1_${s_channel};
                    float n_2 = n_2_${s_channel};
                    float n_3 = n_3_${s_channel};

                    ${o.s_glsl}

                    n_new_${s_channel} = n_new;
                }`
            }).join('\n')
        }).join('\n')}

        
        fragColor = vec4(n_new_red, n_new_green, n_new_blue, 1.0);

        if(n_b_mouse_down_left == 1.0){
            
            float n_hash_r = hashOld12(24.0*o_trn_pix_nor+vec2(1.2, 2.4));
            float n_hash_g = hashOld12(24.0*o_trn_pix_nor+vec2(2.4, 3.6));
            float n_hash_b = hashOld12(24.0*o_trn_pix_nor);
            vec2 odelt = o_trn_mou_nor-o_trn_pix_nor;
            float n_dc = length(odelt);
            float n_ds = max(abs(odelt.x), abs(odelt.y));
            float n_d = 0.5*n_dc+0.5*n_ds;

            fragColor += smoothstep(0.1, 0.09, n_d)*vec4(n_hash_r,n_hash_g,n_hash_b, 1.0);
            // fragColor += smoothstep(0.001, 0.005, n_dc);

            // gl_FragCoord.xy - o_scl_canvas.xy*.5) / vec2(n_min_scl_canvas);
        // vec2 o_trn_mou_nor = (o_trn_mouse.xy
            //fragColor = vec4(n_d,n_d,n_d, 1.);
        }
        if(n_b_mouse_down_middle == 1.0){
            float n_hash_r = hashOld12(24.0*o_trn_pix_nor + n_ms_time*0.004+vec2(1.2, 2.4));
            float n_hash_g = hashOld12(24.0*o_trn_pix_nor + n_ms_time*0.004+vec2(2.2, 4.4));
            float n_hash_b = hashOld12(24.0*o_trn_pix_nor + n_ms_time*0.004+vec2(3.2, 5.4));
            fragColor = vec4(n_hash_r,n_hash_g,n_hash_b, 1.);
        }
        if(n_b_mouse_down_right == 1.0){
            fragColor = vec4(0.,0.,0., 1.);
        }

        //debugging stuff
        // float nasdf = sin(length(o_trn_pix_nor)*22.+n_ms_time*0.001);
        // fragColor = vec4(nasdf);
        // vec4 o_col_factor_from_krnl_red = texelFetch(o_texture_krnl_red, ivec2(0,0), 0);
        // float n_factor_from_krnl_red = f_n_from_o_vec4(o_col_factor_from_krnl_red);
        // fragColor = vec4(vec3(n_factor_from_krnl_red),1.0);
        // fragColor = vec4(vec3(o_scl_krnl_red.r/10.),1.);
    }
    `, 
    {
        antialias: false // blitFrameBfufer wont work without this, since something with multisampling
    },
);


// Create the downsampling shader program
const o_downsample_shader_program = createDownsampleShaderProgram(o_webgl_program.o_ctx);
const o_shader_program_display = createDisplayShaderProgram(o_webgl_program.o_ctx);

// // Get the attribute location
// const a_position = o_webgl_program.o_ctx.getAttribLocation(o_downsample_shader_program, 'a_position');
// // Get the uniform locations
// const u_texture = o_webgl_program.o_ctx.getUniformLocation(o_downsample_shader_program, 'u_texture');
// const u_textureSize = o_webgl_program.o_ctx.getUniformLocation(o_downsample_shader_program, 'u_textureSize');

if (!o_downsample_shader_program) {
    console.error('Failed to create downsampling shader program.');
}

let o_gl = o_webgl_program?.o_ctx;

let o_framebuffer_main1 = o_webgl_program.o_ctx.createFramebuffer();
let o_framebuffer_main2 = o_webgl_program.o_ctx.createFramebuffer();
let o_texture_main1 = o_webgl_program.o_ctx.createTexture();
let o_texture_main2 = o_webgl_program.o_ctx.createTexture();

let o_framebufferinfo = {
    o_framebuffer_downsampled_red: o_webgl_program.o_ctx.createFramebuffer(),
    o_texture_downsampled_red: o_webgl_program.o_ctx.createTexture(),
    a_n_u8_last_frame_downsampled_red: null,
    o_framebuffer_downsampled_green: o_webgl_program.o_ctx.createFramebuffer(),
    o_texture_downsampled_green: o_webgl_program.o_ctx.createTexture(),
    a_n_u8_last_frame_downsampled_green: null,
    o_framebuffer_downsampled_blue: o_webgl_program.o_ctx.createFramebuffer(),
    o_texture_downsampled_blue: o_webgl_program.o_ctx.createTexture(),
    a_n_u8_last_frame_downsampled_blue: null,
}
let o_framebuffer_downsampled = o_webgl_program.o_ctx.createFramebuffer();
let o_texture_downsampled = o_webgl_program.o_ctx.createTexture();

let a_n_u8_last_frame = null;
let a_n_u8_last_frame_downsampled = null;

function setupFramebuffer(o_ctx, o_framebuffer, o_texture, width, height) {
    o_ctx.bindTexture(o_ctx.TEXTURE_2D, o_texture);
    o_ctx.texImage2D(o_ctx.TEXTURE_2D, 0, o_ctx.RGBA, width, height, 0, o_ctx.RGBA, o_ctx.UNSIGNED_BYTE, null);
    o_ctx.texParameteri(o_ctx.TEXTURE_2D, o_ctx.TEXTURE_MIN_FILTER, o_ctx.LINEAR);
    o_ctx.texParameteri(o_ctx.TEXTURE_2D, o_ctx.TEXTURE_MAG_FILTER, o_ctx.LINEAR);

    o_ctx.bindFramebuffer(o_ctx.FRAMEBUFFER, o_framebuffer);
    o_ctx.framebufferTexture2D(o_ctx.FRAMEBUFFER, o_ctx.COLOR_ATTACHMENT0, o_ctx.TEXTURE_2D, o_texture, 0);
}

function resizeFramebuffer(gl, framebuffer, texture, width, height) {
    // Bind the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Bind the texture and resize it
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );

    // Reattach the texture to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );

    // Check if the framebuffer is complete
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer is not complete');
    }

    // Unbind the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
function updateViewport(gl, width, height) {
    gl.viewport(0, 0, width, height);
}
function resizeDownsampledFramebuffer(gl, framebuffer, texture, width, height) {
    // Resize the framebuffer and texture
    resizeFramebuffer(gl, framebuffer, texture, width, height);
    a_n_u8_last_frame_downsampled = new Uint8Array(width*height*4);
    // Update the viewport
    //updateViewport(gl, width, height);
}


let width = o_webgl_program.o_canvas.width;
let height = o_webgl_program.o_canvas.height;

setupFramebuffer(o_webgl_program.o_ctx, o_framebuffer_main1, o_texture_main1, width, height);
setupFramebuffer(o_webgl_program.o_ctx, o_framebuffer_main2, o_texture_main2, width, height);
// Initialize the framebuffer and texture

let a_s_channel = ['red', 'green', 'blue'];
for(let s_channel of a_s_channel){
    resizeDownsampledFramebuffer(
        o_webgl_program.o_ctx,
        o_framebufferinfo[`o_framebuffer_downsampled_${s_channel}`],
        o_framebufferinfo[`o_texture_downsampled_${s_channel}`],
        o_state[`o_scl_krnl_${s_channel}`][0],
        o_state[`o_scl_krnl_${s_channel}`][1]
    );
}


// Create a buffer for the quad
const quadBuffer = o_webgl_program.o_ctx.createBuffer();

// Bind the buffer
o_webgl_program.o_ctx.bindBuffer(o_webgl_program.o_ctx.ARRAY_BUFFER, quadBuffer);

// Upload the vertex data
const quadVertices = new Float32Array([
    -1, -1, // Bottom-left
     1, -1, // Bottom-right
    -1,  1, // Top-left
     1,  1  // Top-right
]);
o_webgl_program.o_ctx.bufferData(o_webgl_program.o_ctx.ARRAY_BUFFER, quadVertices, o_webgl_program.o_ctx.STATIC_DRAW);

o_state_ufloc.n_1 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_1');
o_state_ufloc.n_2 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_2');

o_state_ufloc.n_1_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_1_red');
o_state_ufloc.n_2_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_2_red');
o_state_ufloc.n_3_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_3_red');

o_state_ufloc.n_1_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_1_green');
o_state_ufloc.n_2_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_2_green' );
o_state_ufloc.n_3_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_3_green' );

o_state_ufloc.n_1_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_1_blue');
o_state_ufloc.n_2_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_2_blue') ;
o_state_ufloc.n_3_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_3_blue') ;

o_state_ufloc.n_idx_s_rule_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_idx_s_rule_red');
o_state_ufloc.n_idx_s_rule_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_idx_s_rule_green');
o_state_ufloc.n_idx_s_rule_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_idx_s_rule_blue');
o_state_ufloc.n_b_mouse_down_left = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_b_mouse_down_left');
o_state_ufloc.n_b_mouse_down_middle = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_b_mouse_down_middle');
o_state_ufloc.n_b_mouse_down_right = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_b_mouse_down_right');
o_state_ufloc.o_trn_mouse = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_trn_mouse');

o_state_ufloc.o_scl_krnl_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_scl_krnl_red');
o_state_ufloc.o_scl_krnl_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_scl_krnl_green');
o_state_ufloc.o_scl_krnl_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_scl_krnl_blue');


o_state_ufloc.n_b_normalize_krnl_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_b_normalize_krnl_red');
o_state_ufloc.n_b_normalize_krnl_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_b_normalize_krnl_green');
o_state_ufloc.n_b_normalize_krnl_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_b_normalize_krnl_blue');

for(let s_prop in o_state_ufloc){
    f_try_to_update_ufloc(s_prop, o_state[s_prop])
}

document.body.appendChild(o_canvas);
document.body.oncontextmenu = ()=>{return false}
const a_o_texture = [o_webgl_program?.o_ctx.createTexture(), o_webgl_program?.o_ctx.createTexture()];
const a_o_framebuffer = [o_webgl_program?.o_ctx.createFramebuffer(), o_webgl_program?.o_ctx.createFramebuffer()];
let n_idx_a_o_framebuffer = 0;

let  f_setup_texture_and_framebuffer = function(o_texture, o_framebuffer) {
    o_webgl_program?.o_ctx.bindTexture(o_webgl_program?.o_ctx.TEXTURE_2D, o_texture);

    const a_n_u8 = new Uint8Array(o_webgl_program?.o_canvas.width * o_webgl_program?.o_canvas.height * 4); // 4 for RGBA
    o_webgl_program?.o_ctx.texImage2D(o_webgl_program?.o_ctx.TEXTURE_2D, 0, o_webgl_program?.o_ctx.RGBA, o_webgl_program?.o_canvas.width, o_webgl_program?.o_canvas.height, 0, o_webgl_program?.o_ctx.RGBA, o_webgl_program?.o_ctx.UNSIGNED_BYTE, a_n_u8);

    o_webgl_program?.o_ctx.texParameteri(o_webgl_program?.o_ctx.TEXTURE_2D, o_webgl_program?.o_ctx.TEXTURE_MIN_FILTER, o_webgl_program?.o_ctx.NEAREST);
    o_webgl_program?.o_ctx.texParameteri(o_webgl_program?.o_ctx.TEXTURE_2D, o_webgl_program?.o_ctx.TEXTURE_MAG_FILTER, o_webgl_program?.o_ctx.NEAREST);
    o_webgl_program?.o_ctx.texParameteri(o_webgl_program?.o_ctx.TEXTURE_2D, o_webgl_program?.o_ctx.TEXTURE_WRAP_S, o_webgl_program?.o_ctx.CLAMP_TO_EDGE);
    o_webgl_program?.o_ctx.texParameteri(o_webgl_program?.o_ctx.TEXTURE_2D, o_webgl_program?.o_ctx.TEXTURE_WRAP_T, o_webgl_program?.o_ctx.CLAMP_TO_EDGE);
    
    o_webgl_program?.o_ctx.bindFramebuffer(o_webgl_program?.o_ctx.FRAMEBUFFER, o_framebuffer);
    o_webgl_program?.o_ctx.framebufferTexture2D(o_webgl_program?.o_ctx.FRAMEBUFFER, o_webgl_program?.o_ctx.COLOR_ATTACHMENT0, o_webgl_program?.o_ctx.TEXTURE_2D, o_texture, 0);
}
let f_randomize_texture_data = function(o_texture) {
    const a_n_u8_random = new Uint8Array(o_webgl_program?.o_canvas.width * o_webgl_program?.o_canvas.height * 4);
    for (let i = 0; i < a_n_u8_random.length; i += 4) {
        let value = Math.random() > 0.5 ? 255 : 0;
        // value = ((i/4)%2)*255
        a_n_u8_random[i] = value;     // R
        a_n_u8_random[i + 1] = value; // G
        a_n_u8_random[i + 2] = value; // B
        a_n_u8_random[i + 3] = 255;   // A
    }
    o_webgl_program?.o_ctx.bindTexture(o_webgl_program?.o_ctx.TEXTURE_2D, o_texture);
    o_webgl_program?.o_ctx.texImage2D(o_webgl_program?.o_ctx.TEXTURE_2D, 0, o_webgl_program?.o_ctx.RGBA, o_webgl_program?.o_canvas.width, o_webgl_program?.o_canvas.height, 0, o_webgl_program?.o_ctx.RGBA, o_webgl_program?.o_ctx.UNSIGNED_BYTE, a_n_u8_random);
}


let f_resize = function(){
    // this will resize the canvas and also update 'o_scl_canvas'
    f_resize_canvas_from_o_webgl_program(
        o_webgl_program,
        o_state.n_factor_resolution*globalThis.innerWidth, 
        o_state.n_factor_resolution*globalThis.innerHeight
    )
    //f_setup_texture_and_framebuffer(a_o_texture[0], a_o_framebuffer[0]);
    //f_setup_texture_and_framebuffer(a_o_texture[1], a_o_framebuffer[1]);
    f_randomize_texture_data(a_o_texture[0]);
    f_randomize_texture_data(a_o_texture[1]);

    let width = o_webgl_program.o_canvas.width;
    let height = o_webgl_program.o_canvas.height;
    let n_scl_x_krnl_max = Math.max(o_state.o_scl_krnl_red[0],Math.max(o_state.o_scl_krnl_green[0],o_state.o_scl_krnl_blue[0]));
    let n_scl_y_krnl_max = Math.max(o_state.o_scl_krnl_red[0],Math.max(o_state.o_scl_krnl_green[0],o_state.o_scl_krnl_blue[0]));

    setupFramebuffer(o_webgl_program.o_ctx, o_framebuffer_main1, o_texture_main1, width, height);
    setupFramebuffer(o_webgl_program.o_ctx, o_framebuffer_main2, o_texture_main2, width, height);

    resizeDownsampledFramebuffer(o_webgl_program.o_ctx, o_framebuffer_downsampled, o_texture_downsampled, n_scl_x_krnl_max, n_scl_y_krnl_max);


}
globalThis.addEventListener('resize', ()=>{
    f_resize();
    f_render_from_o_webgl_program_custom(o_webgl_program);

});

f_resize()
// passing a texture 
let f_o_img = async function(s_url){
    return new Promise((f_res, f_rej)=>{
        let o = new Image();
        o.onload = function(){
            return f_res(o)
        }
        o.onerror = (o_err)=>{return f_rej(o_err)}
        o.src = s_url;
    })
}
let o_texture_krnl = {
    o_texture_krnl_red : o_gl.createTexture(),
    o_texture_krnl_green : o_gl.createTexture(),
    o_texture_krnl_blue : o_gl.createTexture(),
}
let o_img_0 = await f_o_img('./download.png')
o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_krnl.o_texture_krnl_red);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_0);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);
o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture

o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_krnl.o_texture_krnl_green);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_0);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);
o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture


o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_krnl.o_texture_krnl_blue);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_0);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);
o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture

const o_texture_last_frame = o_gl.createTexture();
o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_last_frame);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_0);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);
o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture

const o_texture_last_frame_downsampled = o_gl.createTexture();
o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_last_frame_downsampled);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_0);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);
o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture


// Function to write a float32 value into the Uint8Array
function writeFloat32ToTexture(data, offset, value) {
    const floatArray = new Float32Array([value]);
    const intArray = new Uint8Array(floatArray.buffer);

    for (let i = 0; i < 4; i++) {
        data[offset + i] = intArray[i];
    }
}


let o_texture_current = o_texture_main1;
let o_texture_previous = o_texture_main2;

let f_render_from_o_webgl_program_custom = function(
    o_webgl_program
){

    let gl = o_webgl_program.o_ctx;

    if(o_texture_current == o_texture_main1){
        gl.bindFramebuffer(gl.FRAMEBUFFER, o_framebuffer_main1);
    }else{
        gl.bindFramebuffer(gl.FRAMEBUFFER, o_framebuffer_main2);
    }
    
    gl.useProgram(o_webgl_program.o_shader__program);

    const level = 0;
    const internalFormat = o_webgl_program?.o_ctx.RGBA;
    const border = 0;
    const srcFormat = o_webgl_program?.o_ctx.RGBA;
    const srcType = o_webgl_program?.o_ctx.UNSIGNED_BYTE;


    let n_idx_texture = 0;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, o_texture_previous);
    gl.uniform1i(gl.getUniformLocation(o_shader_program_display, 'o_texture_last_frame'), n_idx_texture);
    
    // const o_ufloc_o_texture_0 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_last_frame');
    // o_gl.uniform1i(o_ufloc_o_texture_0, n_idx_texture);  
    // Create a Uint8Array to store the pixel data
    const width = o_webgl_program.o_canvas.width;
    const height = o_webgl_program.o_canvas.height;
    n_idx_texture = 1
    o_gl.activeTexture(o_gl.TEXTURE0+n_idx_texture);
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_krnl.o_texture_krnl_red);
    o_state_ufloc.o_texture_krnl_red = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_krnl_red');
    o_gl.uniform1i(o_state_ufloc.o_texture_krnl_red, n_idx_texture);  

    o_webgl_program?.o_ctx.texImage2D(
        o_webgl_program?.o_ctx.TEXTURE_2D,
        level,
        internalFormat,
        o_state[`o_scl_krnl_red`][0],
        o_state[`o_scl_krnl_red`][1],
        border,
        srcFormat,
        srcType,
        o_texture_data[`o_texture_krnl_red`],
    );  
    n_idx_texture = 2
    o_gl.activeTexture(o_gl.TEXTURE0+n_idx_texture);
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_krnl.o_texture_krnl_green);
    o_state_ufloc.o_texture_krnl_green = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_krnl_green');
    o_gl.uniform1i(o_state_ufloc.o_texture_krnl_green, n_idx_texture);  
    o_webgl_program?.o_ctx.texImage2D(
        o_webgl_program?.o_ctx.TEXTURE_2D,
        level,
        internalFormat,
        o_state[`o_scl_krnl_green`][0],
        o_state[`o_scl_krnl_green`][1],
        border,
        srcFormat,
        srcType,
        o_texture_data[`o_texture_krnl_green`],
    );
    n_idx_texture = 3
    o_gl.activeTexture(o_gl.TEXTURE0+n_idx_texture);
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_krnl.o_texture_krnl_blue);
    o_state_ufloc.o_texture_krnl_blue = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_krnl_blue');
    o_gl.uniform1i(o_state_ufloc.o_texture_krnl_blue, n_idx_texture);  
    o_webgl_program?.o_ctx.texImage2D(
        o_webgl_program?.o_ctx.TEXTURE_2D,
        level,
        internalFormat,
        o_state[`o_scl_krnl_blue`][0],
        o_state[`o_scl_krnl_blue`][1],
        border,
        srcFormat,
        srcType,
        o_texture_data[`o_texture_krnl_blue`],
    );

    // Render your scene
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


    //render to canvas !
    // Unbind the framebuffer (render to the default framebuffer, which is the canvas)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use the display shader program
    gl.useProgram(o_shader_program_display);

    // Bind the texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, o_texture_current);
    gl.uniform1i(gl.getUniformLocation(o_shader_program_display, 'u_texture'), 0);

    // Draw a full-screen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(gl.getAttribLocation(o_shader_program_display, 'a_position'));
    gl.vertexAttribPointer(gl.getAttribLocation(o_shader_program_display, 'a_position'), 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    a_n_u8_last_frame = new Uint8Array(width*height * 4);
    o_webgl_program.o_ctx.readPixels(0, 0, width,height, o_webgl_program.o_ctx.RGBA, o_webgl_program.o_ctx.UNSIGNED_BYTE, a_n_u8_last_frame);
    // console.log(a_n_u8_last_frame)
    
    let n_scl_x_krnl_max = Math.max(o_state.o_scl_krnl_red[0],Math.max(o_state.o_scl_krnl_green[0],o_state.o_scl_krnl_blue[0]));
    let n_scl_y_krnl_max = Math.max(o_state.o_scl_krnl_red[0],Math.max(o_state.o_scl_krnl_green[0],o_state.o_scl_krnl_blue[0]));

    resizeDownsampledFramebuffer(o_webgl_program.o_ctx, o_framebuffer_downsampled, o_texture_downsampled, n_scl_x_krnl_max, n_scl_y_krnl_max);


    for(let s_channel of a_s_channel){

        // resizeDownsampledFramebuffer(
        //     o_webgl_program.o_ctx,
        //     o_framebufferinfo[`o_framebuffer_downsampled_${s_channel}`],
        //     o_framebufferinfo[`o_texture_downsampled_${s_channel}`],
        //     o_state[`o_scl_krnl_${s_channel}`][0],
        //     o_state[`o_scl_krnl_${s_channel}`][1]
        // );

        // Bind the downsampling framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, o_framebufferinfo[`o_framebuffer_downsampled_${s_channel}`]);
    
        let n_scl_x = o_state[`o_scl_krnl_${s_channel}`][0];
        let n_scl_y = o_state[`o_scl_krnl_${s_channel}`][1];
        // Set the viewport to the downsampled resolution
        gl.viewport(0, 0, n_scl_x, n_scl_y);
    
        // Use the downsampling shader program
        gl.useProgram(o_downsample_shader_program);
    
        // Bind the current texture to texture unit 0
        n_idx_texture = 0
        o_gl.activeTexture(o_gl.TEXTURE0+n_idx_texture);
        let o_texture = o_texture_current;
        let n_scl_x_texture = width;
        let n_scl_y_texture = height;
        if(o_state[`n_b_last_frame_as_krnl_${s_channel}`] === false){
            o_texture = o_texture_krnl[`o_texture_krnl_${s_channel}`];
            n_scl_x_texture = o_state[`o_scl_krnl_${s_channel}`][0]
            n_scl_y_texture = o_state[`o_scl_krnl_${s_channel}`][1] 
        }

        o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture);
        gl.uniform1i(gl.getUniformLocation(o_downsample_shader_program, 'u_texture'), n_idx_texture);
        o_webgl_program?.o_ctx.texImage2D(
            o_webgl_program?.o_ctx.TEXTURE_2D,
            level,
            internalFormat,
            n_scl_x_texture,
            n_scl_y_texture,
            border,
            srcFormat,
            srcType,
            o_texture_data[`o_texture_krnl_${s_channel}`],
        );  
        gl.uniform1f(gl.getUniformLocation(o_downsample_shader_program, 'n_b_invert'), (o_state[`n_b_invert_krnl_${s_channel}`] === true) ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(o_downsample_shader_program, 'n_b_mirror_vertical'), (o_state[`n_b_mirror_vertical_${s_channel}`] === true) ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(o_downsample_shader_program, 'n_b_mirror_horizontal'), (o_state[`n_b_mirror_horizontal_${s_channel}`] === true) ? 1 : 0);
        gl.uniform1f(gl.getUniformLocation(o_downsample_shader_program, 'n_b_mirror_diagonal'), (o_state[`n_b_mirror_diagonal_${s_channel}`] === true) ? 1 : 0);
    
        // Set the texture size uniform
        gl.uniform2f(gl.getUniformLocation(o_downsample_shader_program, 'u_textureSize'), n_scl_x_texture, n_scl_y_texture);
    
        // Bind the quad buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(gl.getAttribLocation(o_downsample_shader_program, 'a_position'));
        gl.vertexAttribPointer(gl.getAttribLocation(o_downsample_shader_program, 'a_position'), 2, gl.FLOAT, false, 0, 0);
    
        // Draw the quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
        // Read the downsampled pixels
        o_framebufferinfo[`a_n_u8_last_frame_downsampled_${s_channel}`] = new Uint8Array(n_scl_x*n_scl_y * 4);
        o_webgl_program.o_ctx.readPixels(0, 0, n_scl_x,n_scl_y, o_webgl_program.o_ctx.RGBA, o_webgl_program.o_ctx.UNSIGNED_BYTE, o_framebufferinfo[`a_n_u8_last_frame_downsampled_${s_channel}`]);

        let o_canvas_krnl = o_krnl_canvases[`o_krnl_canvas_${s_channel}`];
        const o_ctx2d = o_krnl_canvases[`o_krnl_canvas_ctx_${s_channel}`];
    
        // Set the canvas size to match the downsampled image
        o_canvas_krnl.width = n_scl_x;
        o_canvas_krnl.height = n_scl_y;
    
        const o_image_data = new ImageData(
            new Uint8ClampedArray(o_framebufferinfo[`a_n_u8_last_frame_downsampled_${s_channel}`]), // Convert to Uint8ClampedArray
            n_scl_x,
            n_scl_y
        );

        // console.log(
        //     o_framebufferinfo[`a_n_u8_last_frame_downsampled_${s_channel}`]
        // );
        // Draw the ImageData onto the canvas
        o_ctx2d.putImageData(o_image_data, 0, 0);

    }
    // console.log(a_n_u8_last_frame_downsampled)

    // Swap textures for the next frame
    let o_tmp = o_texture_previous; 
    o_texture_previous = o_texture_current;
    o_texture_current = o_tmp; 
    // [o_texture_current, o_texture_previous] = [o_texture_previous, o_texture_current];
    // // Draw the square

    // Set the viewport to the downsampled resolution
    gl.viewport(0, 0, width, height);
    
    // o_webgl_program.o_ctx.drawArrays(o_webgl_program.o_ctx.TRIANGLE_STRIP, 0, 4);

    // a_n_u8_last_frame = new Uint8Array(width * height * 4); // RGBA format
    // // Read the pixel data from the framebuffer
    // o_webgl_program.o_ctx.readPixels(0, 0, width, height, o_webgl_program.o_ctx.RGBA, o_webgl_program.o_ctx.UNSIGNED_BYTE, a_n_u8_last_frame);

    // console.log(a_n_u8_last_frame)
    // // downsample the o_texture_last_frame here 
    // let n_scl_x_downsample_target = 10;
    // let n_scl_y_downsample_target = 10;
    // if(!a_n_u8_last_frame_downsampled){
    //     a_n_u8_last_frame_downsampled = new Uint8Array(width*height*4);
    // }

    // o_webgl_program.o_ctx.bindFramebuffer(o_webgl_program.o_ctx.FRAMEBUFFER, null);
    //     // Bind the downsampled framebuffer
    // o_webgl_program.o_ctx.bindFramebuffer(o_webgl_program.o_ctx.FRAMEBUFFER, o_framebuffer_downsampled);

    // o_webgl_program.o_ctx.bindTexture(o_webgl_program.o_ctx.TEXTURE_2D, o_texture_main);

    // // Use the downsampling shader program
    // o_webgl_program.o_ctx.useProgram(o_downsample_shader_program);

    // // Set the texture size uniform
    // o_webgl_program.o_ctx.uniform2f(u_textureSize, width, height);

    // // Bind the original texture
    // o_webgl_program.o_ctx.activeTexture(o_webgl_program.o_ctx.TEXTURE0);
    // o_webgl_program.o_ctx.bindTexture(o_webgl_program.o_ctx.TEXTURE_2D, o_texture_main);
    // o_webgl_program.o_ctx.uniform1i(u_texture, 0);

    // // Bind the vertex buffer
    // o_webgl_program.o_ctx.bindBuffer(o_webgl_program.o_ctx.ARRAY_BUFFER, o_webgl_program.o_buffer_position);
    // o_webgl_program.o_ctx.enableVertexAttribArray(a_position);
    // o_webgl_program.o_ctx.vertexAttribPointer(a_position, 2, o_webgl_program.o_ctx.FLOAT, false, 0, 0);

    // // Draw the quad
    // o_webgl_program.o_ctx.drawArrays(o_webgl_program.o_ctx.TRIANGLE_STRIP, 0, 4);

    // // Allocate a Uint8Array for the downsampled image
    // a_n_u8_last_frame_downsampled = new Uint8Array(n_scl_x_downsample_target * n_scl_y_downsample_target * 4); // RGBA format

    // // Read the pixels from the downsampled framebuffer
    // o_webgl_program.o_ctx.readPixels(
    //     0, 0, 
    //     n_scl_x_downsample_target, n_scl_y_downsample_target, 
    //     o_webgl_program.o_ctx.RGBA, 
    //     o_webgl_program.o_ctx.UNSIGNED_BYTE, 
    //     a_n_u8_last_frame_downsampled
    // );

    // // Unbind the downsampled framebuffer
    // o_webgl_program.o_ctx.bindFramebuffer(o_webgl_program.o_ctx.FRAMEBUFFER, null);

    // o_webgl_program.o_ctx.useProgram(o_webgl_program.o_program);

    gl.useProgram(o_webgl_program.o_shader__program);




}


let o_ufloc__n_ms_time = o_webgl_program?.o_ctx.getUniformLocation(o_webgl_program?.o_shader__program, 'n_ms_time');
o_webgl_program?.o_ctx.uniform1f(o_ufloc__n_ms_time, 0.5);

let n_id_raf = 0;
let n_ms_last = 0;
let n_ms_sum = 0;
let n_ms_count = 0;
let f_raf = function(n_ms){


    // ------------- performance measuring: start
    let n_ms_delta = n_ms-n_ms_last;
    n_ms_sum = parseFloat(n_ms_sum) + parseFloat(n_ms_delta);
    n_ms_count+=1;
    if(n_ms_sum > 1000){
        // console.log(`n_fps ${1000/(n_ms_sum/n_ms_count)}`)
        n_ms_sum= 0;
        n_ms_count= 0;
    }
    // ------------- performance measuring: end
    o_webgl_program?.o_ctx.uniform1f(o_ufloc__n_ms_time, globalThis.performance.now());
    // console.log(globalThis.performance.now())
    if(n_ms_delta > (1000/o_state.n_fps)){   
        f_render_from_o_webgl_program_custom(o_webgl_program);
        n_ms_last = n_ms

    }

    n_id_raf = requestAnimationFrame(f_raf)

}
n_id_raf = requestAnimationFrame(f_raf)


// when finished or if we want to reinitialize a new programm with different GPU code
// we have to first delete the program
// f_delete_o_webgl_program(o_webgl_program)

globalThis.addEventListener('resize', ()=>{
    f_resize();
});







// Determine the current domain
const s_hostname = globalThis.location.hostname;

// Create the WebSocket URL, assuming ws for http and wss for https
const s_protocol_ws = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
const s_url_ws = `${s_protocol_ws}//${s_hostname}:${globalThis.location.port}`;

// Create a new WebSocket instance
const o_ws = new WebSocket(s_url_ws);

// Set up event listeners for your WebSocket
o_ws.onopen = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onopen called'
    })
};

o_ws.onerror = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onerror called'
    })
};

o_ws.onmessage = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onmessage called'
    })
    o_state.a_o_msg.push(o_e.data);
    o_state?.o_js__a_o_mod?._f_render();

};
globalThis.addEventListener('pointerdown', (o_e)=>{
    o_ws.send('pointerdown on client')
})

let f_update_color = function(o_el){
    let n_nor = Math.min(parseFloat(o_el.value),1);
    if(!isNaN(n_nor)){

        let n_c = 255*n_nor;
        o_el.style.backgroundColor = `rgba(${n_c}, ${n_c}, ${n_c}, 1.0)`;
        o_el.style.color = 'white';
        if(n_nor > .5){
            o_el.style.color = 'black';
        }

    }
}
let o_info_krnl = null;
document.body.appendChild(
    await f_o_html_from_o_js(
        {
            style: "width:100vw;user-select: none;",
            f_a_o: async ()=>[
                {
                    s_tag: "button",
                    f_s_innerText:()=>`${(o_state.b_recording ? 'stop recording': 'start recording')}`,
                    onclick:()=>{
                        o_state.b_recording = !o_state.b_recording;
                        if(o_state.b_recording){
                            // Start recording
                            o_media_recorder.start();
                        }
                        if(!o_state.b_recording){
                            o_media_recorder.stop();
                        }
                    },
                    a_s_prop_sync: 'b_recording',
                },
                {
                    s_tag: "button",
                    f_s_innerText:()=>`${(o_state.b_show_inputs ? 'hide': 'show')}`,
                    onclick:()=>{
                        o_state.b_show_inputs = !o_state.b_show_inputs;
                    },
                    a_s_prop_sync: 'b_show_inputs',
                },
                {
                    f_b_render:()=> o_state.b_show_inputs,
                    a_s_prop_sync: 'b_show_inputs',
                    f_a_o: ()=>{
                        return [
                            ...o_state.a_s_channel.map(s_channel=>{
                                return {
                                    f_a_o: async ()=>[
                                        {
                                            style: "display:flex;flex-direction: row", 
                                            f_a_o: ()=>[
                                                {
                                                    style: 'flex: 1 1 auto',
                                                    f_a_o: ()=>[
                                                        {
                                                            innerText: `channel ${s_channel}`
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            f_s_innerText: ()=>{
                                                                return `${(o_state[`n_b_normalize_krnl_${s_channel}`] ? '[x] normalize': '[ ] normalize')}`
                                                            },
                                                            onclick:()=>{
                                                                o_state[`n_b_normalize_krnl_${s_channel}`] = !o_state[`n_b_normalize_krnl_${s_channel}`];
                                                            },
                                                            a_s_prop_sync: `n_b_normalize_krnl_${s_channel}`,
                                                        },
                                                        {
                                                            s_tag: 'input', 
                                                            type:'number',
                                                            min: 2, 
                                                            max: 2048, 
                                                            step: 1,
                                                            a_s_prop_sync: `o_scl_krnl_${s_channel}.0`, 
                                                            oninput: (o_e)=>{
                                                                let n_f = parseFloat(o_e.target.value)
                                                                o_state[`o_scl_krnl_${s_channel}`][0] = n_f;
                                                                o_state[`o_scl_krnl_${s_channel}`][1] = n_f;

                                                                resizeDownsampledFramebuffer(
                                                                    o_webgl_program.o_ctx,
                                                                    o_framebufferinfo[`o_framebuffer_downsampled_${s_channel}`],
                                                                    o_framebufferinfo[`o_texture_downsampled_${s_channel}`],
                                                                    o_state[`o_scl_krnl_${s_channel}`][0],
                                                                    o_state[`o_scl_krnl_${s_channel}`][1]
                                                                );

                                                                f_resize_o_texture_krnl(s_channel);
                                                                f_update_canvas_with_krnl_data(s_channel);
                                                                
                                                            }
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            f_s_innerText: ()=>{
                                                                return `${(o_state[`n_b_last_frame_as_krnl_${s_channel}`] ? '[x]': '[ ]')} use last frame as krnl`
                                                            },
                                                            onclick:()=>{
                                                                o_state[`n_b_last_frame_as_krnl_${s_channel}`] = !o_state[`n_b_last_frame_as_krnl_${s_channel}`];
                                                            },
                                                            a_s_prop_sync: `n_b_last_frame_as_krnl_${s_channel}`,
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            f_s_innerText: ()=>{
                                                                return `${(o_state[`n_b_invert_krnl_${s_channel}`] ? '[x]': '[ ]')} invert krnl`
                                                            },
                                                            onclick:()=>{
                                                                o_state[`n_b_invert_krnl_${s_channel}`] = !o_state[`n_b_invert_krnl_${s_channel}`];
                                                            },
                                                            a_s_prop_sync: `n_b_invert_krnl_${s_channel}`,
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            f_s_innerText: ()=>{
                                                                return `${(o_state[`n_b_mirror_vertical_${s_channel}`] ? '[x]': '[ ]')} mirror vertical`
                                                            },
                                                            onclick:()=>{
                                                                o_state[`n_b_mirror_vertical_${s_channel}`] = !o_state[`n_b_mirror_vertical_${s_channel}`];
                                                            },
                                                            a_s_prop_sync: `n_b_mirror_vertical_${s_channel}`,
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            f_s_innerText: ()=>{
                                                                return `${(o_state[`n_b_mirror_horizontal_${s_channel}`] ? '[x]': '[ ]')} mirror horizontal`
                                                            },
                                                            onclick:()=>{
                                                                o_state[`n_b_mirror_horizontal_${s_channel}`] = !o_state[`n_b_mirror_horizontal_${s_channel}`];
                                                            },
                                                            a_s_prop_sync: `n_b_mirror_horizontal_${s_channel}`,
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            f_s_innerText: ()=>{
                                                                return `${(o_state[`n_b_mirror_diagonal_${s_channel}`] ? '[x]': '[ ]')} mirror diagonal`
                                                            },
                                                            onclick:()=>{
                                                                o_state[`n_b_mirror_diagonal_${s_channel}`] = !o_state[`n_b_mirror_diagonal_${s_channel}`];
                                                            },
                                                            a_s_prop_sync: `n_b_mirror_diagonal_${s_channel}`,
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            innerText: `randomize`,
                                                            onclick:()=>{
                                                                let a_n_u8 = o_texture_data[`o_texture_krnl_${s_channel}`];
                                                                let n2 = 0;
                                                                for(let n = 0; n< a_n_u8.length/4; n+=1){
                                                                    
                                                                    n2 = Math.random();
                                                                    // Fill random float32 values
                                                                    writeFloat32ToTexture(a_n_u8, n * 4, n2);
                                                                }
                                                            },
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            innerText: `1`,
                                                            onclick:()=>{
                                                                let a_n_u8 = o_texture_data[`o_texture_krnl_${s_channel}`];
                                                                let n2 = 0;
                                                                for(let n = 0; n< a_n_u8.length; n+=1){
                                                                    o_texture_data[`o_texture_krnl_${s_channel}`][n] = 255;
                                                                }
                                                            },
                                                        },
                                                        {
                                                            s_tag: 'button', 
                                                            innerText: `0`,
                                                            onclick:()=>{
                                                                let a_n_u8 = o_texture_data[`o_texture_krnl_${s_channel}`];
                                                                let n2 = 0;
                                                                for(let n = 0; n< a_n_u8.length; n+=1){
                                                                    o_texture_data[`o_texture_krnl_${s_channel}`][n] = 0;
                                                                }
                                                            },
                                                        },
                                                        {
                                                            style: 'display:flex;flex-direction: row',
                                                            f_a_o:()=>[
                                                                {
                                                                    style: [
                                                                        `display:flex`, 
                                                                        `flex-wrap:wrap`
                                                                    ].join(';'),
                                                                    f_a_o: ()=>{
                                                                        return [{
                                                                            s_tag: "canvas",
                                                                            class: `krnl_canvas ${s_channel}`,
                                                                            width:  o_state[`o_scl_krnl_${s_channel}`][0], 
                                                                            height:  o_state[`o_scl_krnl_${s_channel}`][1], 
                                                                            onmousedown: (o_e)=>{
                                                                                // debugger
                                                                                let o_canvas = o_e.target.getBoundingClientRect();
                                                                                
                                                                                let o_bounds = o_e.target.getBoundingClientRect();
                                                                                let n_trn_x_nor = (o_e.clientX-o_bounds.left)/o_bounds.width; 
                                                                                let n_trn_y_nor = (o_e.clientY-o_bounds.top)/o_bounds.height;
                                                                                
                                                                                let n_trn_x = parseInt(n_trn_x_nor*o_state[`o_scl_krnl_${s_channel}`][0]);
                                                                                let n_trn_y = parseInt(n_trn_y_nor*o_state[`o_scl_krnl_${s_channel}`][1]);
                                                                                let n_idx_rgba = (n_trn_x+n_trn_y*o_state[`o_scl_krnl_${s_channel}`][0])*4;
                                                                                let o_ctx = o_e.target.getContext('2d');
                                                                                let n_rand_r = parseInt(Math.random()*255);
                                                                                let n_rand_g = parseInt(Math.random()*255);
                                                                                let n_rand_b = parseInt(Math.random()*255);
                                                                                let n_col = 255;
                                                                                if(o_e.button == 0){
                                                                                    n_col = 255
                                                                                }
                                                                                if(o_e.button == 1){
                                                                                    n_col = n_rand_r;
                                                                                }
                                                                                if(o_e.button == 2){
                                                                                    n_col = 0;
                                                                                }
                                                                                o_ctx.fillStyle = "rgba("+n_col+","+n_col+","+n_col+","+(255)+")";
                                                                                o_ctx.fillRect( n_trn_x, n_trn_y, 1, 1 );
                                                                                o_texture_data[`o_texture_krnl_${s_channel}`][n_idx_rgba*4+0] = n_col;
                                                                                o_texture_data[`o_texture_krnl_${s_channel}`][n_idx_rgba*4+1] = n_col;
                                                                                o_texture_data[`o_texture_krnl_${s_channel}`][n_idx_rgba*4+2] = n_col;
                                                                                o_texture_data[`o_texture_krnl_${s_channel}`][n_idx_rgba*4+3] = 255;
                                                                            }
                                                                        }]
                                                                    },
                                                                    f_after_render: (o_e)=>{
                                                                        // console.log(o_e)
                                                                        o_krnl_canvases[`o_krnl_canvas_${s_channel}`] = o_e.querySelector('canvas');
                                                                        console.log(o_krnl_canvases)
                                                                        o_krnl_canvases[`o_krnl_canvas_ctx_${s_channel}`] = o_krnl_canvases[`o_krnl_canvas_${s_channel}`].getContext('2d');
                                                                        f_update_canvas_with_krnl_data(s_channel, o_e)
                                                                    },
                                                                    // a_s_prop_sync: `o_scl_krnl_${s_channel}`
                                                                },
                                                                {
                                                                    f_a_o: ()=>[         
                                                                        {
                                                                            s_tag: "label",
                                                                            innerText: "type",
                                                                        },
                                                                        {
                                                                            s_tag: "select", 
                                                                            a_s_prop_sync: `s_rule_${s_channel}`, 
                                                                            onchange: ()=>{
                                                                                // update automata
                                                                                o_state[`n_idx_s_rule_${s_channel}`] = o_state.a_s_rule.indexOf(
                                                                                    o_state[`s_rule_${s_channel}`]
                                                                                );                                        
                                                                                o_state[`o_automata_${s_channel}`] = o_state.a_o_automata[o_state[`n_idx_s_rule_${s_channel}`]] 
                                                                                let o_automata = o_state[`o_automata_${s_channel}`];
                                                                                if(o_automata?.o_krnl){
                                                                                    let n_scl_x = Math.sqrt(o_automata?.o_krnl.length);
                                                                                    let n_scl_y = n_scl_x;
                                                                                    o_state[`o_scl_krnl_${s_channel}`][0] = n_scl_x;
                                                                                    o_state[`o_scl_krnl_${s_channel}`][1] = n_scl_y;
                                                                                    let n_scl_x_krnl_max = Math.max(o_state.o_scl_krnl_red[0],Math.max(o_state.o_scl_krnl_green[0],o_state.o_scl_krnl_blue[0]));
                                                                                    let n_scl_y_krnl_max = Math.max(o_state.o_scl_krnl_red[0],Math.max(o_state.o_scl_krnl_green[0],o_state.o_scl_krnl_blue[0]));
                                                                                    resizeDownsampledFramebuffer(o_webgl_program.o_ctx, o_framebuffer_downsampled, o_texture_downsampled, n_scl_x_krnl_max, n_scl_y_krnl_max);
                                                                                    f_resize_o_texture_krnl(s_channel);
                                                                                    for(let n_idx in o_automata?.o_krnl){
                                                                                        let n_idx2 = parseInt(n_idx);

                                                                                        let n_nnor = o_automata?.o_krnl[n_idx2];
                                                                                        let n_u8 = ((n_nnor+1)/2)*255
                                                                                        o_texture_data[`o_texture_krnl_${s_channel}`][n_idx2*4+0] = n_u8;
                                                                                        o_texture_data[`o_texture_krnl_${s_channel}`][n_idx2*4+1] = n_u8;
                                                                                        o_texture_data[`o_texture_krnl_${s_channel}`][n_idx2*4+2] = n_u8;
                                                                                        o_texture_data[`o_texture_krnl_${s_channel}`][n_idx2*4+3] = n_u8;
                                                                                    }
                                                                                    f_update_canvas_with_krnl_data(s_channel);
                                                                                }
                                                                                for(let s_prop in o_automata){
                                                                                    let s_prop2 = `${s_prop}_${s_channel}`
                                                                                    if(
                                                                                        s_prop2 in o_state
                                                                                        && 
                                                                                        ['n_1', 'n_2', 'n_3'].includes(s_prop)
                                                                                        ){
                                                                                            o_state[s_prop2] = o_automata[s_prop]
                                                                                    }
                                                                                }
                                                                                //console.log(o_automata )
                                                                            },
                                                                            f_a_o: ()=>{
                                                                                return o_state.a_s_rule.map(s=>{
                                                                                    return {
                                                                                        s_tag: "option",
                                                                                        value: s, 
                                                                                        innerText: s 
                                                                                    }
                                                                                })
                                                                            }
                                                                        },
                                                                    ]
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            a_s_prop_sync: `o_automata_${s_channel}`,
                                                            f_a_o: ()=>{
                                                                return [
                                                                    {
                                                                        s_tag: 'pre', 
                                                                        class: "language-glsl", 
                                                                        style: "background: rgba(0.1, 0.1, 0.1, .9)",
                                                                        f_s_innerHTML: ()=>{
                                                                            let s = (o_state?.[`o_automata_${s_channel}`]?.s_glsl) ? o_state?.[`o_automata_${s_channel}`]?.s_glsl : '//select'
                                                                            // return o?.s_glsl;
                                                                            
                                                                            const highlightedCode = hljs.highlight(
                                                                                s,
                                                                                { language: 'glsl' }
                                                                              ).value
                                                                            return highlightedCode
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    style: 'flex: 1 1 auto',
                                                    f_a_o: ()=>{
                                                        return new Array('1', '2', '3').map(s_num=>{
                                                            console.log(s_num)
                                                            return {
                                                                style: "display:flex;flex-direction:row",
                                                                a_s_prop_sync: [`o_automata_${s_channel}`],
                                                                f_b_render: ()=>{
                                                                    let n = o_state?.[`o_automata_${s_channel}`]?.[`n_${s_num}`];
                                                                    return n != undefined
                                                                },
                                                                f_a_o: async ()=>[
                                                                    {
                                                                        s_tag: "label",
                                                                        innerText: `n${s_num}`,
                                                                    },
                                                                    {
                                                                        s_tag: 'input', 
                                                                        type: "number", 
                                                                        min: -2.0, 
                                                                        max: 2.0, 
                                                                        step:0.001,
                                                                        a_s_prop_sync: [`n_${s_num}_${s_channel}`]
                                                                    },
                                                                    {
                                                                        s_tag: "input", 
                                                                        type: "range", 
                                                                        min: -2.0, 
                                                                        max: 2.0, 
                                                                        step:0.001,
                                                                        a_s_prop_sync: [`n_${s_num}_${s_channel}`]
                                                                    },
                                                                ]
                                                            }
                                                        })
                                                        
                                                   
                                                    }
                                                }
                                            ]
                                        }
                
                
                                    ]
                                }
                            }),
                            {
                                style: "display:flex;flex-direction:row",
                                f_a_o: async ()=>[
                                    {
                                        s_tag: "label",
                                        innerText: "n_fps", 
                                    } ,
                                    {
                                        s_tag: 'input', 
                                        type: "number", 
                                        min: 1.0, 
                                        max: 120.0,
                                        a_s_prop_sync: 'n_fps'
                                    },
                                    {
                                        s_tag: "input", 
                                        type: "range", 
                                        min: 1.0, 
                                        max: 120.0, 
                                        a_s_prop_sync: 'n_fps'
                                    },
            
                                ]
                            },
                            {
                                style: "display:flex;flex-direction:row",
                                f_a_o:async ()=> [
                                    {
                                        s_tag: "label",
                                        innerText: "n_factor_resolution", 
                                    } ,
                                    {
                                        s_tag: 'input', 
                                        type: "number", 
                                        min: 0.01, 
                                        max: 10.0,
                                        step:0.01, 
                                        a_s_prop_sync: 'n_factor_resolution'
                                    },
                                    {
                                        s_tag: "input", 
                                        type: "range", 
                                        min: 0.01, 
                                        max: 10.0,
                                        step:0.01, 
                                        a_s_prop_sync: 'n_factor_resolution', 
                                        oninput: ()=>{
                                            f_resize()
                                            f_render_from_o_webgl_program_custom(o_webgl_program);
                                        }
                                    },
                                ]
                            },
                        ] 
                    }
                }, 
            ]
        }, 
        o_state
    )
)

window.onkeydown = function(o_e){

    o_state.b_ctrl_down = o_e.ctrlKey;
}
window.onkeyup = function(o_e){
    if(o_e.ctrlKey){
        o_state.b_ctrl_down = false;
    }
}
window.onmousedown = function(
    o_e
){
    let s_button = ['left', 'middle', 'right'][o_e.button];
    o_state[`n_b_mouse_down_${s_button}`] = 1
}
window.onmouseup = function(
    o_e
){
    o_state[`n_b_mouse_down_left`] = 0
    o_state[`n_b_mouse_down_middle`] = 0
    o_state[`n_b_mouse_down_right`] = 0
    o_info_krnl = null;
}
window.onmousemove = function(o_e){
    o_state.o_trn_mouse = [
        parseInt(o_e.clientX*o_state.n_factor_resolution),
        parseInt((window.innerHeight-o_e.clientY)*o_state.n_factor_resolution)
    ];
    if(o_info_krnl){
        let n_y_delta = (o_info_krnl.n_trn_y_last - o_e.clientY)/window.innerHeight;
        // console.log(n_y_delta)
        o_info_krnl.o_krnl[o_info_krnl.n_idx] = parseFloat((n_y_delta+o_info_krnl.o_krnl[o_info_krnl.n_idx]).toFixed(2));
        o_info_krnl.n_trn_x_last = o_e.clientX
        o_info_krnl.n_trn_y_last = o_e.clientY
        // console.log(o_info_krnl.o_el_target)
        f_update_color(o_info_krnl.o_el_target);
    }
}


// Assuming you have a WebGL canvas with id 'glcanvas'
const o_stream = o_canvas.captureStream(30); // 30 FPS
const b_mp4_supported = MediaRecorder.isTypeSupported('video/mp4; codecs=avc1.64001e');
if (!b_mp4_supported) {
    console.warn('MP4 (H.264) recording is not supported in this browser.');
}else{
    // alert('supported')
}

const recordedChunks = [];
let s_mime = (b_mp4_supported) ? 'video/mp4; codecs=avc1.64001e': 'video/webm; codecs=vp9'; // Use H.264 codec for MP4
let s_extension_video = s_mime.split(';').shift().split('/').pop();
o_media_recorder = new MediaRecorder(o_stream, {
    mimeType: s_mime, 
    videoBitsPerSecond: 25000000
});

o_media_recorder.ondataavailable = function(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
};

o_media_recorder.onstop = function() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recording.${s_extension_video}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
};
