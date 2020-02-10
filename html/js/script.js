"use strict";

//jquery
$(function(){
})

noise.seed(Math.random());

// 処理内容の関数を生成
function getRandomInt(min, max) {
    let int_min = Math.ceil(min);
    let int_max = Math.floor(max);
    return Math.floor(Math.random() * (int_max - int_min)) + int_min;
}


class DoubleBufferingCanvas {
    constructor(canvas_id, canvas_wrap_name) {
        this.canvas_id = canvas_id;
        this.canvas_wrap_name = canvas_wrap_name;
        this.front_canvas = false;
        this.front_context = false;
        this.back_canvas = false;
        this.back_context = false;
        this.is_get_front_context_succeed = false;
        this.is_get_back_context_succeed = false;
    }
    getIsCanvasContextSucceed() {
        return this.is_get_front_context_succeed && this.is_get_back_context_succeed;
    }
    getBackCanvases() {
        return {canvas:this.back_canvas, context:this.back_context};
    }
    createCanvasContext() {
        this.front_canvas = document.getElementById(this.canvas_id);
        if (this.front_canvas.getContext) {
            this.front_context = this.front_canvas.getContext('2d');
            this.is_get_front_context_succeed = true;
            // console.log(this.is_get_front_context_succeed);
        }
        this.back_canvas = document.createElement('canvas');
        if (this.back_canvas.getContext) {
            this.back_context = this.back_canvas.getContext('2d');
            this.is_get_back_context_succeed = true;
            // console.log(this.is_get_back_context_succeed);
        }
        return this.isCanvasContextSucceed;
    }
    beginDraw() {
        this.front_canvas.width     = $(this.canvas_wrap_name).width();
        this.back_canvas.width      = $(this.canvas_wrap_name).width();
        this.front_canvas.height    = $(this.canvas_wrap_name).height();
        this.back_canvas.height     = $(this.canvas_wrap_name).height();
        // this.front_canvas.width     = 600;
        // this.back_canvas.width      = 600;
        // this.front_canvas.height    = 600;
        // this.back_canvas.height     = 600;
        this.back_context.clearRect(0, 0, this.back_canvas.width, this.back_canvas.height);
    }
    endDraw() {
        this.front_context.drawImage(this.back_canvas, 0, 0);
    }
}

class Draw {
    constructor(backCanvases) {
        this.canvas = backCanvases.canvas;
        this.context = backCanvases.context;
    }
    draw() {
        this.context.beginPath();
        //このコメントの下に描画処理を描く
    }
}

class DrawBack extends Draw {
    constructor(backCanvases, ) {
        super(backCanvases);
        this.patten_canvas = document.createElement('canvas');
        this.patten_context = this.patten_canvas.getContext('2d');
        this.patten_canvas.width = 2;
        this.patten_canvas.height = 4;

        //縦方向にグラデーションさせる
        let gradation = this.patten_context.createLinearGradient(1, Math.ceil(this.patten_canvas.height / 2), 1, this.patten_canvas.height);
        gradation.addColorStop(0, 'rgb(44,56,107)');
        gradation.addColorStop(0.5, 'rgb(44,56,107)');
        gradation.addColorStop(0.5, 'rgb(40,53,102)');
        gradation.addColorStop(1, 'rgb(40,53,102)');
        this.patten_context.fillStyle = gradation;
        this.patten_context.fillRect(0, 0, this.patten_canvas.width, this.patten_canvas.height);
    }
    draw() {
        this.context.beginPath();
        this.context.fillStyle = this.context.createPattern(this.patten_canvas,'repeat');
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class DrawStartLainOsMotions extends Draw {
    constructor(backCanvases, display_width = 1920, display_height = 1060) {
        super(backCanvases);
        this.display_width = display_width;
        this.display_height = display_height;
        this.is_finished_drawing_with_motion = false;
    }
    getIsFinishedDrawingWithMotion(){
        return this.is_finished_drawing_with_motion;
    }
}

class DrawStartLainOsTopSmallCrcle extends DrawStartLainOsMotions{
    constructor(backCanvases, display_width = 1920, display_height = 1060) {
        super(backCanvases);
        this.crcle_x = this.display_width / 2;
        this.crcle_y = 0;
        this.end_crcle_y = Math.ceil(this.display_height * 0.75);
        this.crcle_r = 10;
        this.crcle_begin_rad = 0 * Math.PI / 180;
        this.crcle_end_rad = 360 * Math.PI / 180;
        this.circle_v = 10;
        this.circle_opacity = 0.80;
        this.circle_opacity_v = 0.125;
    }
    draw() {
        let is_draw_execute = !(this.getIsFinishedDrawingWithMotion());
        if(is_draw_execute) {
            this.context.beginPath();
            this.context.shadowColor = 'rgb(56,149,223)';
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
            this.context.shadowBlur = 15;

            let is_top_small_circle_disappears = this.crcle_y >= this.end_crcle_y;
            if(is_top_small_circle_disappears) {
                if(this.circle_opacity > this.circle_opacity_v){
                    this.circle_opacity -= this.circle_opacity_v;
                }
                else{
                    this.circle_opacity = 0;
                    this.is_finished_drawing_with_motion = true;
                }
            }
            this.context.fillStyle = 'rgba(80,189,244,'+ this.circle_opacity + ')';

            this.context.arc(this.crcle_x,
                this.crcle_y,
                this.crcle_r,
                this.crcle_begin_rad,
                this.crcle_end_rad,
                false
                );
            this.context.fill();
            this.crcle_y += this.circle_v;
        }
        else {
            return;
        }
    }
}

class DrawStartLainOsBottomSmallCrcle extends DrawStartLainOsMotions {
    constructor(backCanvases, display_width = 1920, display_height = 1060) {
        super(backCanvases);
        this.crcle_x = this.display_width / 2;
        this.crcle_y = this.display_height;
        this.end_crcle_y = Math.ceil(this.display_height * 0.25);
        this.crcle_r = 10;
        this.crcle_begin_rad = 0 * Math.PI / 180;
        this.crcle_end_rad = 360 * Math.PI / 180;
        this.circle_v = 10;
        this.circle_opacity = 0.80;
    }
    draw() {
        this.context.beginPath();
        if(this.crcle_y < this.end_crcle_y) {
            this.crcle_y = this.end_crcle_y;
            this.is_finished_drawing_with_motion = true;
        }

        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;

        this.context.fillStyle = 'rgba(80,189,244,'+ this.circle_opacity + ')';

        this.context.arc(
            this.crcle_x,
            this.crcle_y,
            this.crcle_r,
            this.crcle_begin_rad,
            this.crcle_end_rad,
            false
            );
        this.context.fill();
        let is_draw_execute = !(this.getIsFinishedDrawingWithMotion());
        if(is_draw_execute) {
            this.crcle_y -= this.circle_v;
        }
    }
}

class DrawStartLainOsBottomRotateCrcle extends Draw {
    constructor(backCanvases, display_width = 1920, display_height = 1060) {
        super(backCanvases);
    }
}

class DrawStartLainOs extends Draw {
    constructor(backCanvases, display_width = 1920, display_height = 1060) {
        super(backCanvases);
        this.back               = new DrawBack(backCanvases);
        this.top_small_crcle    = new DrawStartLainOsTopSmallCrcle(backCanvases);
        this.bottom_small_crcle = new DrawStartLainOsBottomSmallCrcle(backCanvases);
    }
    draw() {
        this.back.draw();
        this.top_small_crcle.draw();
        if (this.top_small_crcle.getIsFinishedDrawingWithMotion()) {
            this.bottom_small_crcle.draw();
        }
    }
}








// function getRandomInt(min, max) {
//     let int_min = Math.ceil(min);
//     let int_max = Math.floor(max);
//     return Math.floor(Math.random() * (int_max - int_min)) + int_min;
// }

// class FillWithRandomColorsFromAllDirections {
//     constructor(backCanvases) {
//         this.back_canvas = backCanvases.canvas;
//         this.back_context = backCanvases.context;
//         this.is_next_filling_start = true;
//         this.v_vector_x = 0;
//         this.v_vector_y = 0;
//         this.rotate_rad = 0;
//         this.v_vector_integration = 0
//         this.now_fill_color = null;
//         this.last_fill_color = 'white';
//         this.start_position_x = 0;
//         this.start_position_y = 0;
//         this.is_fill_complete = false;
//     }
//     draw() {
//         if (this.is_next_filling_start) {
//             this.v_vector_x = getRandomInt(-10, 10);
//             this.v_vector_y = getRandomInt(-10, 10);
//             let is_v_vector_first_quadrant      = (this.v_vector_x) >= 0 && (this.v_vector_y >= 0);
//             let is_v_vector_second_quadrant     = (this.v_vector_x) <  0 && (this.v_vector_y >= 0);
//             let is_v_vector_third_quadrant      = (this.v_vector_x) <  0 && (this.v_vector_y <  0);
//             let is_v_vector_fourth_quadrant     = (this.v_vector_x) >= 0 && (this.v_vector_y <  0);
//             if(is_v_vector_first_quadrant) {
//                 this.start_position_x = 0;
//                 this.start_position_y = this.back_canvas.height;
//                 this.rotate_rad = Math.atan2(this.v_vector_y, this.v_vector_x) + Math.PI;
//                 // this.rotate_rad = 0 / (360) * 2 * Math.PI;
//             }else if(is_v_vector_second_quadrant) {
//                 this.start_position_x = this.back_canvas.width;
//                 this.start_position_y = this.back_canvas.height;
//                 this.rotate_rad = Math.atan2(this.v_vector_y, this.v_vector_x) + 2 * Math.PI;
//             }else if(is_v_vector_third_quadrant) {
//                 this.start_position_x = this.back_canvas.width;
//                 this.start_position_y = 0;
//                 this.rotate_rad = Math.atan2(this.v_vector_y, this.v_vector_x)+ Math.PI;
//             }else if(is_v_vector_fourth_quadrant) {
//                 this.start_position_x = 0;
//                 this.start_position_y = 0;
//                 this.rotate_rad = Math.atan2(this.v_vector_y, this.v_vector_x);
//             }
//             this.v_vector_integration = 0;
//             let r = getRandomInt(0, 255);
//             let g = getRandomInt(0, 255);
//             let b = getRandomInt(0, 255);
//             this.now_fill_color = 'rgb('+ r + ',' + g + ',' + b + ')';
//         }
//         let v_vector_size = Math.sqrt(this.v_vector_x ** 2 + this.v_vector_y **2);
//         this.v_vector_integration += v_vector_size * 4 + 20;
//         this.is_fill_complete = this.v_vector_integration >= Math.sqrt(this.back_canvas.width ** 2 + this.back_canvas.height **2);
//         if (this.is_fill_complete) {
//             this.is_next_filling_start = true;
//             this.last_fill_color = this.now_fill_color;
//         }else {
//             this.is_next_filling_start = false;
//         }

//         this.back_context.beginPath();
//         this.back_context.strokeStyle = this.last_fill_color;
//         this.back_context.fillStyle = this.last_fill_color;
//         this.back_context.fillRect(0, 0, this.back_canvas.width, this.back_canvas.height);

//         this.back_context.save();
//         this.back_context.beginPath();
//         this.back_context.translate(this.start_position_x, this.start_position_y);
//         this.back_context.strokeStyle = this.now_fill_color;
//         this.back_context.fillStyle = this.now_fill_color;
//         this.back_context.rotate(this.rotate_rad);
//         this.back_context.fillRect(0, 0, 1000, this.v_vector_integration);
//         this.back_context.fillRect(1, 0, -1000, this.v_vector_integration);
//         this.back_context.restore();

//         // this.back_context.strokeStyle = 'black';
//         // this.back_context.fillStyle = 'black';
//         // this.back_context.fillRect(10, 10, 200, 100);
//         console.log('this.v_vector_x        :'+this.v_vector_x);
//         console.log('this.v_vector_y        :'+this.v_vector_y);
//         console.log('this.start_position_x  :'+this.start_position_x);
//         console.log('this.start_position_y  :'+this.start_position_y);
//         console.log('this.rotate_rad        :'+this.rotate_rad / ( 2 * Math.PI) * 360);
//         console.log('---------------------------------------');
//     }
// }




let double_buffering_canvas = new DoubleBufferingCanvas('main_canvas', '.canvas_wrap');

window.addEventListener('load', function() {
    $.when(
        double_buffering_canvas.createCanvasContext()
    )
    .done(function() {
        // すべて成功した時の処理
        let canvases = double_buffering_canvas.getBackCanvases();
        let start_lain_os = new DrawStartLainOs(canvases, 800, 600);
        let draws = function() {
            double_buffering_canvas.beginDraw();
            start_lain_os.draw();
            double_buffering_canvas.endDraw();
        }
        if (double_buffering_canvas.getIsCanvasContextSucceed()) {
            let update_interval = 1000/30;//ms
            let update = setInterval (draws,update_interval);
        }
    })
    .fail(function() {
        // エラーがあった時
    });
})


