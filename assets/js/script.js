"use strict";

//jquery
$(function(){
})

noise.seed(Math.random());

// 処理内容の関数を生成
const FPS = 20;
const KEY_BEGIN_POS     = "begin_pos";
const KEY_END_POS       = "end_pos";
const KEY_MILLISECONDS  = "milliseconds";
const KEY_V             = "v";
const KEY_POS           = "pos";


const required = (param) => {
    throw new Error(`Required parameter, "${param}"`);
};

function getRandomInt(min, max) {
    let int_min = Math.round(min);
    let int_max = Math.floor(max);
    return Math.floor(Math.random() * (int_max - int_min)) + int_min;
}

function arcWrap({
    context         = required(ctx),
    x               =  1920 / 2,
    y               = 1060 / 2,
    radius          = 10,
    startAngle      = 0 * Math.PI / 180,
    endAngle        = 360 * Math.PI / 180,
    anticlockwise   = false,
    }={}) {
    context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
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
        this.context.save();
        this._draw();
        this.context.restore();
    }
    _draw() {
        this.context.beginPath();
        //このコメントの下に描画処理を描く
    }
}

class DrawBack extends Draw {
    constructor(backCanvases) {
        super(backCanvases);
        this.patten_canvas = document.createElement('canvas');
        this.patten_context = this.patten_canvas.getContext('2d');
        this.patten_canvas.width = 2;
        this.patten_canvas.height = 4;

        //縦方向にグラデーションさせる
        this.context.save();
        let gradation = this.patten_context.createLinearGradient(1, Math.round(this.patten_canvas.height / 2), 1, this.patten_canvas.height);
        gradation.addColorStop(0, 'rgb(44,56,107)');
        gradation.addColorStop(0.5, 'rgb(44,56,107)');
        gradation.addColorStop(0.5, 'rgb(40,53,102)');
        gradation.addColorStop(1, 'rgb(40,53,102)');
        this.patten_context.fillStyle = gradation;
        this.patten_context.fillRect(0, 0, this.patten_canvas.width, this.patten_canvas.height);
        this.context.restore();
    }
    _draw() {
        this.context.beginPath();
        this.context.fillStyle = this.context.createPattern(this.patten_canvas,'repeat');
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

class AnimationController {
    constructor({
        begin_end_milliseconds_sets = required("begin_end_milliseconds_sets"),
        fps                         = required("fps"),
        } = {}) {
        this.fps = fps;
        this.move_sets = [];
        for(let sets of begin_end_milliseconds_sets) {
            let v = this._getV({
                begin_pos       : sets.KEY_BEGIN_POS,
                end_pos         : sets.KEY_END_POS,
                milliseconds    : sets.KEY_MILLISECONDS,
            });
            let move_set = {
                KEY_BEGIN_POS       : sets.KEY_BEGIN_POS,
                KEY_END_POS         : sets.KEY_END_POS,
                KEY_MILLISECONDS    : sets.KEY_MILLISECONDS,
                KEY_V               : v,
                KEY_POS             : sets.KEY_BEGIN_POS,
            };
            this.move_sets.push(move_set);
        }
        this.i = 0;
        this.pos = this.begin_pos;
        this.is_begin_update = false;
        this.is_move_completed = false;
        this.is_repeat = false;
    }
    _getV({
        begin_pos       = required("begin_pos"),
        end_pos         = required("end_pos"),
        milliseconds    = required("milliseconds"),
        } = {}){
        let move_distance = end_pos - begin_pos;
        let draw_update_num = milliseconds / (1000 / this.fps);
        return  move_distance / draw_update_num;
    }
    getPos() {
        return this.move_sets[this.i].KEY_POS;
    }
    getIsAnimationCompleted(){
        return this.is_move_completed;
    }
    setIsBeginUpdate() {
        this.is_begin_update = true;
    }
    setIsRepeat() {
        this.is_repeat = true;
    }
    updatePos() {
        let is_update = this.is_begin_update && !(this.is_move_completed);
        if(is_update) {
            let end_pos = this.move_sets[this.i].KEY_END_POS;
            let v       = this.move_sets[this.i].KEY_V;
            let pos     = this.move_sets[this.i].KEY_POS;
            let is_v_positive_direction = v >= 0;
            let is_arrived_positive_direction = is_v_positive_direction && (pos >= end_pos + v);
            let is_arrived_negative_direction = !(is_v_positive_direction) && (pos <= end_pos - v);
            let is_arrived = is_arrived_positive_direction || is_arrived_negative_direction;
            if(is_arrived ) {
                this.move_sets[this.i].KEY_POS = end_pos;
                let is_last = this.i === this.move_sets.length - 1;
                if(is_last) {
                    if(this.is_repeat) {
                        for(let set of this.move_sets) {
                            set.KEY_POS = set.KEY_BEGIN_POS;
                        }
                        this.i = 0;
                    }
                    else {
                        this.is_move_completed = true;
                    }
                }
                else {
                    this.i++;
                }
            }
            else {
                this.move_sets[this.i].KEY_POS += v;
            }
        }
    }
}


class DrawStartLainOsAnimation extends Draw {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.display_width = display_width;
        this.display_height = display_height;
        this.fps = fps;
    }
    getIsFinishedDrawingWithAnimation(){
        return false;
    }
}

class DrawStartLainOsTopSmallCrcle extends DrawStartLainOsAnimation{
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.y =
            new AnimationController({
               begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0,
                        KEY_END_POS         : Math.round(this.display_height * 0.70),
                        KEY_MILLISECONDS    : 1250,
                    },
                ],
                fps : this.fps,
            });
        this.opcity =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.80,
                        KEY_END_POS         : 0,
                        KEY_MILLISECONDS    : 150,
                    },
                ],
                fps : this.fps,
            });
    }
    getIsFinishedDrawingWithAnimation(){
        return this.y.getIsAnimationCompleted();
    }
    _draw() {
        let is_draw_execute = !(this.getIsFinishedDrawingWithAnimation());
        if(is_draw_execute) {

            this.y.setIsBeginUpdate();
            this.y.updatePos();

            if(this.y.getIsAnimationCompleted()) {
                this.opcity.setIsBeginUpdate();
                this.opcity.updatePos();
            }

            this.context.beginPath();
            this.context.shadowColor = 'rgb(56,149,223)';
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
            this.context.shadowBlur = 15;
            this.context.fillStyle = 'rgba(80,189,244,'+ this.opcity.getPos() + ')';

            arcWrap({
                context : this.context,
                y       : Math.round(this.y.getPos()),
                radius  : 15,
            });

            this.context.fill();
        }
        else {
            return;
        }
    }
}

class DrawStartLainOsBottomSmallCrcle extends DrawStartLainOsAnimation {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.opacity = 0.80;
        this.y =
            new AnimationController({
               begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : this.display_height,
                        KEY_END_POS         : Math.round(this.display_height * 0.26),
                        KEY_MILLISECONDS    : 1250,
                    },
                ],
                fps : this.fps,
            });
    }
    getIsFinishedDrawingWithAnimation(){
        return this.y.getIsAnimationCompleted();
    }
    _draw() {
        this.y.setIsBeginUpdate();
        this.y.updatePos();

        this.context.beginPath();
        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        this.context.fillStyle = 'rgba(80,189,244,'+ this.opacity + ')';
        arcWrap({
            context : this.context,
            y       : Math.round(this.y.getPos()),
            radius  : 15,
        });
        this.context.fill();
    }
}


class DrawStartLainOsBottomRotateCrcle extends DrawStartLainOsAnimation {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.y =
            new AnimationController({
               begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : Math.round(this.display_height * 0.75),
                        KEY_END_POS         : Math.round(this.display_height * 0.4),
                        KEY_MILLISECONDS    : 1000,
                    },
                ],
                fps : this.fps,
            });
        this.r =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 60,
                        KEY_END_POS         : Math.round(this.display_width * 0.5),
                        KEY_MILLISECONDS    : 1000,
                    },
                    {
                        KEY_BEGIN_POS       : Math.round(this.display_width * 0.5),
                        KEY_END_POS         : 60,
                        KEY_MILLISECONDS    : 1000,
                    },
                ],
                fps : this.fps,
            });
        this.opcity =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.1,
                        KEY_END_POS         : 1,
                        KEY_MILLISECONDS    : 1000,
                    },
                    {
                        KEY_BEGIN_POS       : 1,
                        KEY_END_POS         : 0,
                        KEY_MILLISECONDS    : 500,
                    },
                ],
                fps : this.fps,
            });
        this.lineWidth =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 10,
                        KEY_END_POS         : 50,
                        KEY_MILLISECONDS    : 1000,
                    },
                    {
                        KEY_BEGIN_POS       : 50,
                        KEY_END_POS         : 1,
                        KEY_MILLISECONDS    : 500,
                    },
                ],
                fps : this.fps,
            });
        this.scale_y =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.25,
                        KEY_END_POS         : 1,
                        KEY_MILLISECONDS    : 1000,
                    },
                ],
                fps : this.fps,
            });
    }
    getIsFinishedDrawingWithAnimation() {
        let is =
                this.y.getIsAnimationCompleted()
            &&  this.r.getIsAnimationCompleted()
            &&  this.lineWidth.getIsAnimationCompleted()
            &&  this.opcity.getIsAnimationCompleted()
            &&  this.scale_y.getIsAnimationCompleted()
            ;
        return is;

    }
    getIsExecuteNextDraw() {
        let is =
                this.y.getIsAnimationCompleted()
            &&  this.scale_y.getIsAnimationCompleted()
            ;
        return is;

    }
    getNowR() {
        return this.r.getPos();
    }
    _draw() {
        this.y.setIsBeginUpdate();
        this.r.setIsBeginUpdate();
        this.lineWidth.setIsBeginUpdate();
        this.opcity.setIsBeginUpdate();
        this.scale_y.setIsBeginUpdate();
        this.y.updatePos();
        this.r.updatePos();
        this.lineWidth.updatePos();
        this.opcity.updatePos();
        this.scale_y.updatePos();

        this.context.beginPath();
        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        this.context.scale(1, this.scale_y.getPos());

        arcWrap({
            context         : this.context,
            y               :  Math.round(this.y.getPos() / this.scale_y.getPos()),
            radius          : this.r.getPos(),
        });


        // this.context.arc(
        //    this.display_width / 2,
        //     Math.round(this.y.getPos() / this.scale_y.getPos()),
        //     this.r.getPos(),
        //     0 * Math.PI / 180,
        //     360 * Math.PI / 180,
        //     false
        //     );
        this.context.fillStyle = "rgba(0,0,0,0)";
        this.context.strokeStyle = "rgba(69,187,243," + this.opcity.getPos() + ")";
        this.context.lineWidth = this.lineWidth.getPos();

        this.context.fill();
        this.context.stroke();
    }
}




class DrawStartLainOsBigOutsideCrcle extends DrawStartLainOsAnimation {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.r =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0,
                        KEY_END_POS         : 0,
                        KEY_MILLISECONDS    : 0,
                    },
                ],
                fps : this.fps,
            });
        this.is_r_seted = false;

        this.opcity =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.1,
                        KEY_END_POS         : 1,
                        KEY_MILLISECONDS    : 1500,
                    },
                ],
                fps : this.fps,
            });

        this.lineWidth =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 50,
                        KEY_END_POS         : 30,
                        KEY_MILLISECONDS    : 1500,
                    },

                ],
                fps : this.fps,
            });
    }
    setOnleyOnceR(now_r){
        if (this.is_r_seted) {
            //何もしない
        }
        else {
            this.r =
                new AnimationController({
                    begin_end_milliseconds_sets : [
                        {
                            KEY_BEGIN_POS       : now_r + 400,
                            KEY_END_POS         : 100,
                            KEY_MILLISECONDS    : 1500,
                        },
                    ],
                    fps : this.fps,
                });
            this.is_r_seted = true;
        }
    }
    getIsExecuteNextDraw() {
        return this.is_r_seted && this.r.getPos() <= 800;
    }
    _draw() {

        this.r.setIsBeginUpdate();
        this.r.updatePos();
        this.lineWidth.setIsBeginUpdate();
        this.lineWidth.updatePos();
        this.opcity.setIsBeginUpdate();
        this.opcity.updatePos();

        this.context.beginPath();
        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        arcWrap({
            context         : this.context,
            y               : Math.round(this.display_height * 0.4),
            radius          : this.r.getPos(),
        });
        this.context.fillStyle = "rgba(0,0,0,0)";
        this.context.strokeStyle = "rgba(69,187,243," + this.opcity.getPos() + ")";
        this.context.lineWidth = this.lineWidth.getPos();

        this.context.fill();
        this.context.stroke();
    }
}

class DrawStartLainOsBigInsideCrcle extends DrawStartLainOsAnimation {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.r =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 300,
                        KEY_END_POS         : 50,
                        KEY_MILLISECONDS    : 800,
                    },
                ],
                fps : this.fps,
            });
        this.opcity =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.1,
                        KEY_END_POS         : 1,
                        KEY_MILLISECONDS    : 1500,
                    },
                ],
                fps : this.fps,
            });
    }
    _draw() {
        this.r.setIsBeginUpdate();
        this.r.updatePos();
        this.opcity.setIsBeginUpdate();
        this.opcity.updatePos();

        this.context.beginPath();
        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        arcWrap({
            context         : this.context,
            y               : Math.round(this.display_height * 0.4),
            radius          : this.r.getPos(),
        });
        this.context.fillStyle = "rgba(69,187,243," + this.opcity.getPos() + ")";
        this.context.fill();
    }
}


class DrawStartLainOsBigTranslucentCrcle extends DrawStartLainOsAnimation {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.opcity =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.0,
                        KEY_END_POS         : 0.1,
                        KEY_MILLISECONDS    : 2000,
                    },
                ],
                fps : this.fps,
            });
    }
    _draw() {
        this.opcity.setIsBeginUpdate();
        this.opcity.updatePos();

        this.context.beginPath();
        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        arcWrap({
            context         : this.context,
            y               : Math.round(this.display_height * 0.4),
            radius          : 150,
        });
        this.context.fillStyle = "rgba(69,187,243," + this.opcity.getPos() + ")";
        this.context.fill();
    }
}


class DrawStartLainOsTopRightSmallCrcle extends DrawStartLainOsAnimation {
    constructor(backCanvases, display_width = 1920, display_height = 1060, fps = FPS) {
        super(backCanvases);
        this.x =
            new AnimationController({
               begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : Math.round(this.display_width / 2),
                        KEY_END_POS         : Math.round(this.display_width / 2 + 400),
                        KEY_MILLISECONDS    : 1000,
                    },
                    {
                        KEY_BEGIN_POS       : Math.round(this.display_width / 2),
                        KEY_END_POS         : Math.round(this.display_width / 2 + 200),
                        KEY_MILLISECONDS    : 1000,
                    },
                ],
                fps : this.fps,
            });
        this.y =
            new AnimationController({
               begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0,
                        KEY_END_POS         : Math.round(this.display_height * 0.4 + 100),
                        KEY_MILLISECONDS    : 1000,
                    },
                ],
                fps : this.fps,
            });
        this.opcity =
            new AnimationController({
                begin_end_milliseconds_sets : [
                    {
                        KEY_BEGIN_POS       : 0.0,
                        KEY_END_POS         : 1.0,
                        KEY_MILLISECONDS    : 1000,
                    },
                ],
                fps : this.fps,
            });
    }
    _draw() {
        this.x.setIsBeginUpdate();
        this.x.updatePos();
        this.y.setIsBeginUpdate();
        this.y.updatePos();
        this.opcity.setIsBeginUpdate();
        this.opcity.updatePos();

        this.context.beginPath();
        this.context.shadowColor = 'rgb(56,149,223)';
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        arcWrap({
            context         : this.context,
            x               : Math.round(this.x.getPos()),
            y               : Math.round(this.y.getPos()),
            radius          : 20,
        });
        this.context.fillStyle = "rgba(69,187,243," + this.opcity.getPos() + ")";
        this.context.fill();
    }
}



class DrawStartLainOs extends Draw {
    constructor(backCanvases, display_width = 1920, display_height = 1060) {
        super(backCanvases);
        this.back                   = new DrawBack(backCanvases);
        this.top_small_crcle        = new DrawStartLainOsTopSmallCrcle(backCanvases);
        this.bottom_small_crcle     = new DrawStartLainOsBottomSmallCrcle(backCanvases);
        this.bottom_rotate_crcle    = new DrawStartLainOsBottomRotateCrcle(backCanvases);
        this.big_outside_crcle      = new DrawStartLainOsBigOutsideCrcle(backCanvases);
        this.big_inside_crcle       = new DrawStartLainOsBigInsideCrcle(backCanvases);
        this.big_translucen_crcle   = new DrawStartLainOsBigTranslucentCrcle(backCanvases);
        this.top_right_small_crcle  = new DrawStartLainOsTopRightSmallCrcle(backCanvases);
    }
    _draw() {
        this.back.draw();
        this.top_small_crcle.draw();
        if (this.top_small_crcle.getIsFinishedDrawingWithAnimation()) {
            this.bottom_small_crcle.draw();
            this.bottom_rotate_crcle.draw();
        }

        if(this.bottom_rotate_crcle.getIsExecuteNextDraw()) {
            this.big_outside_crcle.setOnleyOnceR(this.bottom_rotate_crcle.getNowR());
            this.big_outside_crcle.draw();
        }
        if(this.big_outside_crcle.getIsExecuteNextDraw()) {
            this.big_inside_crcle.draw();
            this.big_translucen_crcle.draw();
            this.top_right_small_crcle.draw();
        }


    }
}



let double_buffering_canvas = new DoubleBufferingCanvas('main_canvas', '.canvas_wrap');

window.addEventListener('load', function() {
    $.when(
        double_buffering_canvas.createCanvasContext()
    )
    .done(function() {
        // すべて成功した時の処理
        let canvases = double_buffering_canvas.getBackCanvases();
        let start_lain_os = new DrawStartLainOs(canvases);
        let draws = function() {
            double_buffering_canvas.beginDraw();
            start_lain_os.draw();
            double_buffering_canvas.endDraw();
        }
        if (double_buffering_canvas.getIsCanvasContextSucceed()) {
            let update_interval = 1000/FPS;//ms
            let update = setInterval (draws,update_interval);
        }
    })
    .fail(function() {
        // エラーがあった時
    });
})


