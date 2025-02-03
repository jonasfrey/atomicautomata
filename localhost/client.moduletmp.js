
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html__and_make_renderable,
}from 
'./f_o_html__and_make_renderable.module.js'

import {
    f_o_webgl_program,
    f_delete_o_webgl_program,
    f_resize_canvas_from_o_webgl_program,
    f_render_from_o_webgl_program,
    f_o_proxified_and_add_listeners, 
    f_o_html_from_o_js
} from "https://deno.land/x/handyhelpers@5.1.2/mod.js"

import {
    f_s_hms__from_n_ts_ms_utc,
} from "https://deno.land/x/date_functions@2.0.0/mod.js"  

//readme.md:start
            //md: # 'f_flat_frontend_framework' 
            //md:  a minimal / lightweight / small / flat frontend framework

            class O_person{
                constructor(
                    s_name, 
                    n_age, 
                    b_male,
                    a_s_short_name,
                    f_s_full_name
                ){
                    this.s_name = s_name
                    this.n_age = n_age
                    this.b_male = b_male
                    this.a_s_short_name = a_s_short_name
                    this.f_s_full_name = f_s_full_name
                }
            }
            let a_o_person = [
                new O_person(
                    'hans person_idx_0', 
                    10, 
                    true, 
                    ['hansi', 'haenschen', 'haensel'],
                    ()=>{
                        return this.s_name + this.a_s_short_name.join(' ')
                    }
                ),
                new O_person(
                    'greta person_idx_1', 
                    10, 
                    false, 
                    ['gretchen', 'gretel']
                )
            ]
            let f_callback_beforevaluechange = function(a_s_path, v_old, v_new){
                console.log('a_s_path')
                console.log(a_s_path)
                let s_path = a_s_path.join('.');
                if(s_path == 'a_o_person.0.s_name'){
                    console.log('name of first person will be changed')
                }
            }
            let f_callback_aftervaluechange = function(a_s_path, v_old, v_new){
                console.log('a_s_path')
                console.log(a_s_path)
                let s_path = a_s_path.join('.');
                if(s_path == 'a_o_person.0.s_name'){
                    console.log('name of first person has been changed')
                }
            }
            let o_div = document.createElement('div');
            document.body.appendChild(o_div);
            // first we define our data in a state object
            let o_state = f_o_proxified_and_add_listeners(
                {
                    o_person: a_o_person[0],
                    a_o_person, 
                    n_test: 1, 
                    n_1: 0.2, 
                    n_2: 0.5,
                    s_test: "test", 
                    b_test: true, 
                    f_test:()=>{return 'test function executed succesfully'},
                    a_o: [{n:1},{n:2}], 
                }, 
                f_callback_beforevaluechange,
                f_callback_aftervaluechange, 
                o_div
            )
            
            window.o_state = o_state
            
            let f_sleep_ms = async function(n_ms){
                return new Promise((f_res, f_rej)=>{
                    setTimeout(()=>{
                        return f_res(true)
                    },n_ms)
                })
            }
            // then we build the html 
            let o = await f_o_html_from_o_js(
                {
                    f_a_o:()=>{
                        return [

                            {
                                s_tag: "input", 
                                type: "range", 
                                min: 0, 
                                max: 1, 
                                step: 0.01, 
                                a_s_prop_sync: ["n_1"],
                            },
                            {
                                s_tag: "input", 
                                type: "range", 
                                min: 0, 
                                max: 1, 
                                step: 0.01, 
                                a_s_prop_sync: ["n_1"],
                            },
                            {
                                s_tag: 'input', 
                                type: "number", 
                                a_s_prop_sync: ['n_1']
                            },
                        ]
                    }
                },
                o_state
            )

            o_div.appendChild(o);
            
            o_state.a_o_person.push(
                new O_person('ludolf person_idx_2', 20)
            )
            o_state.a_o_person.push(
                new O_person(
                    'ueli person_idx_3', 
                    10, 
                    false, 
                    ['ul']
                )
            )
            o_state.a_o_person[0].s_name = `${o_state.a_o_person[0].s_name}_new`
            o_state.a_o_person[1].s_name = `${o_state.a_o_person[1].s_name}_new`
            o_state.a_o_person[1] = {s_name: 'person idx_2 lol'}

            // array manipulation
            o_state.a_o_person.push({s_name: 'regula person_idx_4', n_age: 20, b_male:false, a_s_short_name:['regle']});
            o_state.a_o_person.push({s_name: 'regina person_idx_5', n_age: 20, b_male:false, a_s_short_name:['regne']});
            o_state.a_o_person.push({s_name: 'ruedi person_idx_6', n_age: 20, b_male:true, a_s_short_name:['rud']});
            o_state.a_o_person.splice(2, 1); // Removes 1 element at index 2 // removes  lol therefore

            o_state.a_o_person.pop();// remove last item // removes ruadi

            o_state.a_o_person[2].s_name = o_state.a_o_person[2].s_name+'n3wcrypt1cn4m3'
            let o_tmp = o_state.a_o_person[2];
            o_tmp.s_name = o_tmp.s_name+'_n3wcrypt1cn4m3' // change by reference // changes ueli to ludolf
            console.log('pop1')
            o_state.a_o_person.pop()
            window.setTimeout(()=>{

                    console.log('pop2')
                    o_state.a_o_person.pop()
                    console.log('pop3')
                    o_state.a_o_person.pop()
                
                // console.log(o_state.a_o_person)
                // window.setTimeout(()=>{
                //     o_state.a_o_person.pop()
                //     // o_state.a_o_person.pop()
                
                // },1)
            },2111)