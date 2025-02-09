
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
    f_o_proxified_and_add_listeners, 
    f_o_html_from_o_js
} from "https://deno.land/x/handyhelpers@5.1.6/mod.js"

import {
    f_s_hms__from_n_ts_ms_utc,
} from "https://deno.land/x/date_functions@2.0.0/mod.js"  

let a_o_shader = []
let n_idx_a_o_shader = 0;
let o_state_ufloc = {}
let o_state = f_o_proxified_and_add_listeners(
    {
        b_show_inputs: true,
        n_1: 0.5, 
        n_2: 0.2, 
        n_fps: 1,
        n_factor_resolution: 0.2,
        o_shader: {},
        o_state_notifire: {},
        n_idx_a_o_shader,
        a_o_shader,
        n_number: 23,
    },
    ()=>{},
    (a_s_path, v_old, v_new) => {
        let s_path = a_s_path.join('.');
        let o_ufloc = o_state_ufloc[`o_ufloc__${s_path}`];
        
        if(o_ufloc){
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
    
        }

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
    ${
        f_s_css_from_o_variables(
            o_variables
        )
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
    uniform sampler2D o_texture_0;
    uniform sampler2D o_texture_1;
    uniform float n_1;
    uniform float n_2;

    void main() {
        // gl_FragCoord is the current pixel coordinate and available by default
        
        vec2 o_trn_pix_nor = (gl_FragCoord.xy - o_scl_canvas.xy*.5) / vec2(min(o_scl_canvas.x, o_scl_canvas.y));
        vec2 o_trn_pix_nor2 = (o_trn_pix_nor+.5);
        o_trn_pix_nor2.y = 1.-o_trn_pix_nor2.y;
        float n1 = (o_trn_pix_nor.x*o_trn_pix_nor.y);
        float n2 = sin(length(o_trn_pix_nor)*3.);
        float n_t = n_ms_time *0.005;
        float n = sin(n_t*0.2)*n1 + 1.-cos(n_t*0.2)*n2; 
        vec4 o_pixel_from_image_0 = texture(o_texture_0, o_trn_pix_nor2+vec2(0.009, -0.08));
        vec4 o_pixel_from_image_1 = texture(o_texture_1, o_trn_pix_nor2+vec2(0.009, -0.08));
        vec4 o_last = texelFetch(o_texture_last_frame, ivec2(gl_FragCoord.xy), 0);
        if(n_ms_time < 1000.){
            fragColor = vec4(o_last.rgb, 1.0);
            return;
        }


    
        ivec2 texelCoord = ivec2(gl_FragCoord.xy); // Convert fragment coordinates to integer texel coordinates
    
        // Define a 3x3 kernel
        int kernel[9] = int[9](-1, 0, 1,  -1, 0, 1,  -1, 0, 1);
        
        // Sum the values of the neighboring pixels (excluding the center pixel)
        float sum = 0.0;
        float n_count = 0.;
        for (int i = -3; i <= 3; i++) {
            for (int j = -3; j <= 3; j++) {
                ivec2 neighborCoord = texelCoord + ivec2(i, j);
                vec4 neighbor = texelFetch(o_texture_last_frame, neighborCoord, 0);
                if (i != 0 || j != 0) { // Exclude the center pixel
                    n_count+=1.;
                    float n2 = (neighbor.r > .5) ? 1.0 : 0.0;
                    sum += n2; 
                }
            }
        }
        float n_nor = sum/n_count;

        n = 0.0;
        if(n_nor > n_1 || n_nor < n_2){
            n = o_last.r-n_nor;
        }else{
            n = o_last.r+n_nor;
        }

        fragColor = vec4(n, n, n, 1.0);

    }
    `, 
    {
        antialias: false // blitFrameBfufer wont work without this, since something with multisampling
    },
);
o_webgl_program?.o_ctx.blitFramebuffer.bind(o_webgl_program?.o_ctx);

document.body.appendChild(o_canvas);

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
    f_setup_texture_and_framebuffer(a_o_texture[0], a_o_framebuffer[0]);
    f_setup_texture_and_framebuffer(a_o_texture[1], a_o_framebuffer[1]);
    f_randomize_texture_data(a_o_texture[0]);
    f_randomize_texture_data(a_o_texture[1]);

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
let o_img_0 = await f_o_img('./download.png')
let o_gl = o_webgl_program?.o_ctx;
const o_texture_0 = o_gl.createTexture();
o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_0);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_0);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);

o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture

let o_img_1 = await f_o_img('./download.png')
const o_texture_1 = o_gl.createTexture();
o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_1);
o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGBA, o_gl.RGBA, o_gl.UNSIGNED_BYTE, o_img_1);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_S, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_WRAP_T, o_gl.CLAMP_TO_EDGE);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MIN_FILTER, o_gl.LINEAR);
o_gl.texParameteri(o_gl.TEXTURE_2D, o_gl.TEXTURE_MAG_FILTER, o_gl.LINEAR);
o_gl.bindTexture(o_gl.TEXTURE_2D, null);  // Unbind the texture


let f_render_from_o_webgl_program_custom = function(
    o_webgl_program
){

    let n_idx_a_o_framebuffer_next = (n_idx_a_o_framebuffer+1)%a_o_texture.length
    // Render to the offscreen framebuffer
    o_webgl_program.o_ctx.bindFramebuffer(o_webgl_program.o_ctx.FRAMEBUFFER, a_o_framebuffer[n_idx_a_o_framebuffer_next]);


    o_webgl_program.o_ctx.bindBuffer(o_webgl_program.o_ctx.ARRAY_BUFFER, o_webgl_program.o_buffer_position);
    o_webgl_program.o_ctx.enableVertexAttribArray(o_webgl_program.o_afloc_a_o_vec_position_vertex);
    o_webgl_program.o_ctx.vertexAttribPointer(o_webgl_program.o_afloc_a_o_vec_position_vertex, 2, o_webgl_program.o_ctx.FLOAT, false, 0, 0);
    

    let n_idx_texture = 0;
    o_webgl_program.o_ctx.activeTexture(o_webgl_program.o_ctx.TEXTURE0+n_idx_texture);
    o_webgl_program.o_ctx.bindTexture(o_webgl_program.o_ctx.TEXTURE_2D, a_o_texture[n_idx_a_o_framebuffer]);
    const o_ufloc_o_texture_0 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_last_frame');
    o_gl.uniform1i(o_ufloc_o_texture_0, n_idx_texture);  

    n_idx_texture = 1
    o_gl.activeTexture(o_gl.TEXTURE0+n_idx_texture);
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_0);
    const o_ufloc_o_texture_1 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_0');
    o_gl.uniform1i(o_ufloc_o_texture_1, n_idx_texture);  
    n_idx_texture = 2
    o_gl.activeTexture(o_gl.TEXTURE0+n_idx_texture);
    o_gl.bindTexture(o_gl.TEXTURE_2D, o_texture_1);
    const o_uloc_o_texture_2 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'o_texture_1');
    o_gl.uniform1i(o_uloc_o_texture_2, n_idx_texture);  


    o_state_ufloc.o_ufloc__n_1 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_1');
    o_state_ufloc.o_ufloc__n_2 = o_gl.getUniformLocation(o_webgl_program?.o_shader__program, 'n_2');
    // Render the cellular automata step to the offscreen framebuffer
    o_webgl_program.o_ctx.drawArrays(o_webgl_program.o_ctx.TRIANGLE_STRIP, 0, 4);

    // Now copy the framebuffer to the canvas using blitFramebuffer (for WebGL 2.0)
    // Use WebGL2's blitFramebuffer to efficiently copy the framebuffer
    o_webgl_program.o_ctx.bindFramebuffer(o_webgl_program.o_ctx.READ_FRAMEBUFFER, a_o_framebuffer[n_idx_a_o_framebuffer_next]);
    o_webgl_program.o_ctx.bindFramebuffer(o_webgl_program.o_ctx.DRAW_FRAMEBUFFER, null); // Canvas framebuffer
    o_webgl_program.o_ctx.blitFramebuffer(
        0, 0, o_webgl_program.o_canvas.width, o_webgl_program.o_canvas.height,
        0, 0, o_webgl_program.o_canvas.width, o_webgl_program.o_canvas.height,
        o_webgl_program.o_ctx.COLOR_BUFFER_BIT, o_webgl_program.o_ctx.NEAREST
    );
    n_idx_a_o_framebuffer = n_idx_a_o_framebuffer_next


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




let mouseX = 0;
let mouseY = 0;
let clickX = 0;
let clickY = 0;
let isMouseDown = false;

// Event listener for mouse move
o_canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Event listener for mouse down
o_canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    clickX = event.clientX;
    clickY = event.clientY;
});

// Event listener for mouse up
o_canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
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


document.body.appendChild(
    await f_o_html_from_o_js(
        {
            style: "width:100vw",
            f_a_o: async ()=>[
                {
                    s_tag: "button",
                    f_s_innerText:()=>`${(o_state.b_show_inputs ? 'hide': 'show')}`,
                    onclick:()=>{
                        o_state.b_show_inputs = !o_state.b_show_inputs;
                    }
                },
                {
                    b_render: o_state.b_show_inputs,
                    f_a_o: async ()=>[

                        {
                            style: "display:flex;flex-direction:row",
                            f_a_o: async ()=>[
                                {
                                    s_tag: "label",
                                    innerText: "n1",
                                },
                                {
                                    s_tag: 'input', 
                                    type: "number", 
                                    min: 0.0, 
                                    max: 1.0, 
                                    step:0.001,
                                    a_s_prop_sync: ['n_1']
                                },
                                {
                                    s_tag: "input", 
                                    type: "range", 
                                    min: 0.0, 
                                    max: 1.0, 
                                    step:0.001,
                                    a_s_prop_sync: ['n_1']
                                },
                            ]
                        },
                        {
                            style: "display:flex;flex-direction:row",
                            f_a_o: async ()=> [
                                {
                                    s_tag: "label",
                                    innerText: "n2",
                                },
                                {
                                    s_tag: 'input', 
                                    type: "number", 
                                    min: 0.0, 
                                    max: 1.0, 
                                    step:0.001,
                                    a_s_prop_sync: ['n_2']
                                },
                                {
                                    s_tag: "input", 
                                    type: "range", 
                                    min: 0.0, 
                                    max: 1.0, 
                                    step:0.001,
                                    a_s_prop_sync: ['n_2']
                                },
        
                            ]
                        },
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
                                    }
                                },
                            ]
                        },
                    ]
                }
            ]
        }, 
        o_state
    )
)





window.onmousemove = function(o_e){
    let n_nor = o_e.clientX / window.innerWidth;
    o_state.n_number = parseInt(n_nor*10.);
    console.log('n_number is set to n_nor_x_mouse * 10')
}