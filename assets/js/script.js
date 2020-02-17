"use strict";

//jquery
$(function(){
})

noise.seed(Math.random());

// 処理内容の関数を生成
const FPS = 60;
const DISPLAY_WIDTH = 1920;
const DISPLAY_HEIGHT = 1060;
const SMALL_CIRCLE_RADIUS = 15;
const CENTER_X = Math.round(DISPLAY_WIDTH * 0.5);
const CENTER_Y = Math.round(DISPLAY_HEIGHT * 0.4);

const required = (param) => {
    throw new Error(`Required parameter, "${param}"`);
};

function getRandomInt(min, max) {
    let int_min = Math.round(min);
    let int_max = Math.floor(max);
    return Math.floor(Math.random() * (int_max - int_min)) + int_min;
}

function arcWrap({
    context         = required(context),
    x               = DISPLAY_WIDTH / 2,
    y               = DISPLAY_HEIGHT / 2,
    radius          = 10,
    startAngle      = 0 * Math.PI / 180,
    endAngle        = 360 * Math.PI / 180,
    anticlockwise   = false,
    }={}) {
    return context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
}

function arcToWrap({
    context = required(context),
    x1,
    y1,
    x2,
    y2,
    radius,
    }={}) {
    return context.arcTo(x1, y1, x2, y2, radius);
}

function moveToWrap({
    context = required(context),
    x,
    y,
    }={}) {
    return context.moveTo(x, y);
}

function lineToWrap({
    context = required(context),
    x,
    y,
    }={}) {
    return context.lineTo(x, y);
}

function fillRectWrap({
    context = required(context),
    x,
    y,
    width,
    height,
    }={}){
    return context.fillRect(x, y, width, height);
}

function createLinearGradientWrap({
    context = required(context),
    x0,
    y0,
    x1,
    y1,
    }={}){
    return context.createLinearGradient(x0, y0, x1, y1);
}

function drawImageWrap3arg({
    context = required(context),
    image,
    dx,
    dy,
    }={}){
    return context.drawImage(image, dx, dy);
}

function clearRectWrap({
    context = required(context),
    x,
    y,
    width,
    height,
    }={}){
    return context.clearRect(x, y, width, height);
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
        clearRectWrap({
            context : this.back_context,
            x       : 0,
            y       : 0,
            width   : this.back_canvas.width,
            height  : this.back_canvas.height,
        });
    }
    endDraw() {
        drawImageWrap3arg({
            context : this.front_context,
            image   : this.back_canvas,
            dx      : 0,
            dy      : 0,
        });
    }
}

class Draw {
    constructor(back_canvases) {
        this.canvas = back_canvases.canvas;
        this.context = back_canvases.context;
    }
    draw() {
        this.context.save();
        this.context.beginPath();
        this._draw();
        this.context.restore();
    }
    _draw() {
        //このコメントの下に描画処理を描く
    }
}

class DrawBack extends Draw {
    constructor(back_canvases) {
        super(back_canvases);
        this.patten_canvas = document.createElement('canvas');
        this.patten_context = this.patten_canvas.getContext('2d');
        this.patten_canvas.width = 2;
        this.patten_canvas.height = 4;

        //縦方向にグラデーションさせる
        this.context.save();
        this.context.beginPath();
        let gradation = createLinearGradientWrap({
            context : this.patten_context,
            x0      : 1,
            y0      : Math.round(this.patten_canvas.height / 2),
            x1      : 1,
            y1      : this.patten_canvas.height,
        });

        gradation.addColorStop(0,   'rgb(44,56,107)');
        gradation.addColorStop(0.5, 'rgb(44,56,107)');
        gradation.addColorStop(0.5, 'rgb(40,53,102)');
        gradation.addColorStop(1,   'rgb(40,53,102)');
        this.patten_context.fillStyle = gradation;
        fillRectWrap({
            context     : this.patten_context,
            x           : 0,
            y           : 0,
            width       : this.patten_canvas.width,
            height      : this.patten_canvas.height,
        });
        this.context.restore();
    }
    _draw() {
        this.context.fillStyle = this.context.createPattern(this.patten_canvas,'repeat');
        fillRectWrap({
            context     : this.context,
            x           : 0,
            y           : 0,
            width       : this.canvas.width,
            height      : this.canvas.height,
        });
    }
}



const AC_KEY_CALLBACK               = "callback";
const AC_KEY_BEGIN_VALUE            = "begin_value";
const AC_KEY_END_VALUE              = "end_value";
const AC_KEY_MILLISECONDS           = "milliseconds";

const AC_KEY_ACC_MILLISECONDS       = "acc_milliseconds";
const AC_KEY_ACC_BEGIN_V_PERCENT    = "acc_begin_v_percent";

const AC_KEY_DCC_MILLISECONDS       = "dcc_milliseconds";
const AC_KEY_DCC_END_V_PERCENT      = "dcc_begin_v_percent";

const AC_KEY_V                      = "v";
const AC_KEY_VALUE                  = "value";
const AC_KEY_ARRIVED_COUNT          = "arrived_count";
class AnimationController {
    constructor({
        callback                = undefined,
        animation_define_sets   = required("animation_define_sets"),
        is_repeat               = false,
        } = {}) {
        this.callback = callback;
        this.animation_move_sets = [];
        for(let animation_define_set of animation_define_sets) {
            let v = this._getVelocity({
                begin_value         : animation_define_set.AC_KEY_BEGIN_VALUE,
                end_value           : animation_define_set.AC_KEY_END_VALUE,
                milliseconds        : animation_define_set.AC_KEY_MILLISECONDS,
                acc_milliseconds    : animation_define_set.AC_KEY_ACC_MILLISECONDS
                                        ? animation_define_set.AC_KEY_ACC_MILLISECONDS : 0,
                acc_begin_v_percent : animation_define_set.AC_KEY_ACC_BEGIN_V_PERCENT
                                        ? animation_define_set.AC_KEY_ACC_BEGIN_V_PERCENT : 0,
                dcc_milliseconds    : animation_define_set.AC_KEY_DCC_MILLISECONDS
                                        ? animation_define_set.AC_KEY_DCC_MILLISECONDS : 0,
                dcc_end_v_percent : animation_define_set.AC_KEY_DCC_END_V_PERCENT
                                        ? animation_define_set.AC_KEY_DCC_END_V_PERCENT : 0,
            });
            let animatin_move_set = {
                AC_KEY_CALLBACK         : animation_define_set.AC_KEY_CALLBACK
                                            ? animation_define_set.AC_KEY_CALLBACK : undefined,
                AC_KEY_BEGIN_VALUE      : animation_define_set.AC_KEY_BEGIN_VALUE,
                AC_KEY_END_VALUE        : animation_define_set.AC_KEY_END_VALUE,
                AC_KEY_MILLISECONDS     : animation_define_set.AC_KEY_MILLISECONDS,
                AC_KEY_ACC_MILLISECONDS : animation_define_set.AC_KEY_ACC_MILLISECONDS
                                            ? animation_define_set.AC_KEY_ACC_MILLISECONDS : 0,
                AC_KEY_DCC_MILLISECONDS : animation_define_set.AC_KEY_DCC_MILLISECONDS
                                            ? animation_define_set.AC_KEY_DCC_MILLISECONDS : 0,
                AC_KEY_V                : v,
                AC_KEY_VALUE            : animation_define_set.AC_KEY_BEGIN_VALUE,
                AC_KEY_ARRIVED_COUNT    : 0,

            };
            this.animation_move_sets.push(animatin_move_set);
        }
        this.i = 0;
        this.is_begin_update = false;
        this.is_move_completed = false;
        this.is_repeat = is_repeat;
    }
    _getVelocity({
        begin_value     = required("begin_value"),
        end_value       = required("end_value"),
        milliseconds    = required("milliseconds"),
        acc_milliseconds,
        acc_begin_v_percent,
        dcc_milliseconds,
        dcc_end_v_percent,
        } = {}){
        let move_distance = end_value - begin_value;
        let draw_update_num         = milliseconds / (1000 / FPS);

        let acc_draw_update_num         = 0;
        let acc_rectangle_coefficient   = 0;
        let acc_triangle_coefficient    = 0;
        let acc_coefficient             = 0;
        let is_acc_exits                = !(acc_milliseconds === 0);
        if(is_acc_exits) {
            acc_draw_update_num         = acc_milliseconds / (1000 / FPS);
            acc_rectangle_coefficient   = acc_begin_v_percent * acc_draw_update_num;
            acc_triangle_coefficient    = 0.5 * (1 - acc_begin_v_percent) * acc_draw_update_num;
            acc_coefficient             = acc_rectangle_coefficient + acc_triangle_coefficient;
        }

        let dcc_draw_update_num         = 0;
        let dcc_rectangle_coefficient   = 0;
        let dcc_triangle_coefficient    = 0;
        let dcc_coefficient             = 0;
        let is_dcc_exits = !(dcc_milliseconds === 0);
        if(is_dcc_exits) {
            dcc_draw_update_num  = dcc_milliseconds / (1000 / FPS);
            dcc_rectangle_coefficient   = dcc_end_v_percent * dcc_draw_update_num;
            dcc_triangle_coefficient    = 0.5 * (1 - dcc_end_v_percent) * dcc_draw_update_num;
            dcc_coefficient             = dcc_rectangle_coefficient + dcc_triangle_coefficient;
        }

        let constant_speed_coefficient  = draw_update_num - acc_draw_update_num - dcc_draw_update_num;
        let coefficient_z = acc_coefficient + dcc_coefficient + constant_speed_coefficient;
        let v_max = move_distance / coefficient_z;
        let v_min = v_max / 100;

        let v_acc_min   = 0;
        let a_acc       = 0;
        let acc_end_i   =0;
        if(is_acc_exits) {
            v_acc_min   = v_max * acc_begin_v_percent;
            a_acc       = acc_draw_update_num ? (v_max - v_acc_min) / acc_draw_update_num : 0;
            acc_end_i   = Math.round(acc_draw_update_num);
        }
        let v_dcc_min   = 0;
        let a_dcc       = 0;
        let dcc_begin_i = 0;
        if(is_dcc_exits) {
            v_dcc_min   = v_max * dcc_end_v_percent;
            a_dcc       = dcc_draw_update_num ? (v_max - v_dcc_min) / dcc_draw_update_num : 0;
            dcc_begin_i = Math.round(draw_update_num - dcc_draw_update_num);
        }

        return (i) => {
                let is_acc = i < acc_end_i;
                let is_dcc = i > dcc_begin_i;
                if(is_acc) {
                    let v_acc = a_acc * i;
                    return Math.abs(v_acc) < Math.abs(v_min) ? v_min : v_acc;
                }
                else if(is_dcc) {
                    let v_dcc =  v_max - a_dcc * (i - dcc_begin_i);
                    return Math.abs(v_dcc) < Math.abs(v_min) ? v_min : v_dcc;
                }
                else {
                    console.log(acc_end_i + ":"+dcc_begin_i + ":" +v_max);
                    return v_max;
                }
            };
    }
    getValue() {
        let callback = this.animation_move_sets[this.i].AC_KEY_CALLBACK;
        let is_callvack_exits = callback !== undefined;
        let value = this.animation_move_sets[this.i].AC_KEY_VALUE
        if (is_callvack_exits) {
            return callback(value);
        }
        else
        {
            return value;
        }

        return this.animation_move_sets[this.i].AC_KEY_VALUE;
    }
    getNowAnimationIndex(){
        return this.i;
    }
    getIsAnimationCompleted(){
        return this.is_move_completed;
    }
    setIsBeginUpdate() {
        this.is_begin_update = true;
    }
    setIsRepeat(is_repeat) {
        this.is_repeat = is_repeat;
    }


    updateValue() {
        let is_update = this.is_begin_update && !(this.is_move_completed);
        if(is_update) {
            let value           = this.animation_move_sets[this.i].AC_KEY_VALUE;
            let arrived_count   = this.animation_move_sets[this.i].AC_KEY_ARRIVED_COUNT;
            let milliseconds    = this.animation_move_sets[this.i].AC_KEY_MILLISECONDS;
            let v               = this.animation_move_sets[this.i].AC_KEY_V(arrived_count);

            let is_v_0 = v === 0;
            let is_v_0_arrived = is_v_0 && (arrived_count >= (milliseconds / (1000 / FPS)));

            let is_v_positive_direction = v >= 0;
            let end_value = this.animation_move_sets[this.i].AC_KEY_END_VALUE;
            let is_arrived_positive_direction = is_v_positive_direction && (value >= end_value);
            let is_arrived_negative_direction = !(is_v_positive_direction) && (value <= end_value);
            let is_v_exits = !(is_v_0);
            let is_v_exits_arrived = is_v_exits && (is_arrived_positive_direction || is_arrived_negative_direction);

            let is_arrived = is_v_0_arrived  || is_v_exits_arrived;
            if(is_arrived) {
                this.animation_move_sets[this.i].AC_KEY_VALUE = end_value;
                let is_last = this.i === this.animation_move_sets.length - 1;
                if(is_last) {
                    if(this.is_repeat) {
                        for(let set of this.animation_move_sets) {
                            set.AC_KEY_VALUE = set.AC_KEY_BEGIN_VALUE;
                        }
                        this.i = 0;
                        for(let animation_define_set of this.animation_move_sets) {
                            animation_define_set.AC_KEY_ARRIVED_COUNT = 0;
                        }
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
                this.animation_move_sets[this.i].AC_KEY_VALUE += v;
            }
            this.animation_move_sets[this.i].AC_KEY_ARRIVED_COUNT++;
        }
    }
    beginUpdateAndUpdateValue() {
        this.setIsBeginUpdate();
        this.updateValue();
    }
}

class StartLainOsAnimation extends Draw {
    constructor(back_canvases) {
        super(back_canvases);
    }
    getShadowColor(a = 1) {
        return "rgba(56,149,223,"  + a + ")";
    }
    getColor(a = 1) {
        return "rgba(69,187,243," + a + ")";
    }
}

class TopSmallCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.y =
            new AnimationController({
               animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : Math.round(DISPLAY_HEIGHT * 0.70),
                        AC_KEY_MILLISECONDS    : 1250,
                    },
                ],
            });
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.80,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 300,
                    },
                ],
            });
    }
    getIsYCompleted() {
        return this.y.getIsAnimationCompleted();
    }
    _draw() {
        let is_animation_completed = this.y.getIsAnimationCompleted() && this.opcity.getIsAnimationCompleted();
        let is_draw_execute = !(is_animation_completed);
        if(is_draw_execute) {

            this.y.setIsBeginUpdate();
            this.y.updateValue();

            if(this.y.getIsAnimationCompleted()) {
                this.opcity.setIsBeginUpdate();
                this.opcity.updateValue();
            }

            // this.context.beginPath();
            this.context.shadowColor    = this.getShadowColor();
            this.context.shadowOffsetX  = 0;
            this.context.shadowOffsetY  = 0;
            this.context.shadowBlur     = 15;
            this.context.fillStyle = this.getColor(this.opcity.getValue());

            arcWrap({
                context : this.context,
                y       : Math.round(this.y.getValue()),
                radius  : SMALL_CIRCLE_RADIUS,
            });

            this.context.fill();
        }
        else {
            return;
        }
    }
}

class BottomSmallCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 500,
                    },
                ],
            });
        this.y =
            new AnimationController({
               animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : DISPLAY_HEIGHT,
                        AC_KEY_END_VALUE       :
                                CENTER_Y
                            -   BIG_TRANSLUCENT_CRCLE_RADIUS
                            -   BIG_TRANSLUCENT_CRCLE_LINE_WIDTH / 2,
                        AC_KEY_MILLISECONDS     : 2000,
                    },
                ],
            });
    }
    _draw() {
        this.opcity.beginUpdateAndUpdateValue();
        this.y.beginUpdateAndUpdateValue();

        this.context.shadowColor    = this.getShadowColor();
        this.context.shadowOffsetX  = 0;
        this.context.shadowOffsetY  = 0;
        this.context.shadowBlur     = 15;

        this.context.fillStyle = this.getColor(this.opcity.getValue());
        arcWrap({
            context : this.context,
            y       : Math.round(this.y.getValue()),
            radius  : SMALL_CIRCLE_RADIUS,
        });
        this.context.fill();
    }
}

class BottomSlantingCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.y =
            new AnimationController({
               animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : Math.round(DISPLAY_HEIGHT * 0.75),
                        AC_KEY_END_VALUE       : CENTER_Y,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
        let radius = 60;
        this.radius =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : radius,
                        AC_KEY_END_VALUE       : CENTER_X,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : CENTER_X,
                        AC_KEY_END_VALUE       : radius,
                        AC_KEY_MILLISECONDS    : 750,
                    },
                ],
            });
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.1,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 1,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 750,
                    },
                ],
            });
        this.lineWidth =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 10,
                        AC_KEY_END_VALUE       : 50,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 50,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 750,
                    },
                ],
            });
        this.scale_y =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
    }
    getIsYandScaleComplted() {
        let is_completed =
                this.y.getIsAnimationCompleted()
            &&  this.scale_y.getIsAnimationCompleted()
            ;
        return is_completed;

    }
    getNowR() {
        return this.radius.getValue();
    }
    _draw() {
        this.y.beginUpdateAndUpdateValue();
        this.radius.beginUpdateAndUpdateValue();
        this.lineWidth.beginUpdateAndUpdateValue();
        this.opcity.beginUpdateAndUpdateValue();
        this.scale_y.beginUpdateAndUpdateValue();

        this.context.shadowColor = this.getShadowColor();
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        this.context.scale(1, this.scale_y.getValue());

        arcWrap({
            context         : this.context,
            y               :  Math.round(this.y.getValue() / this.scale_y.getValue()),
            radius          : this.radius.getValue(),
        });

        this.context.fillStyle = "rgba(0,0,0,0)";
        this.context.strokeStyle = this.getColor(this.opcity.getValue());
        this.context.lineWidth = this.lineWidth.getValue();

        this.context.fill();
        this.context.stroke();
    }
}

const BIG_OUTSIDE_END_RADIUS        = 100;
const BIG_OUTSIDE_END_LINE_WIDTH    = 30;
class BigOutsideCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.radius =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 200,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 900,
                        AC_KEY_END_VALUE       : BIG_OUTSIDE_END_RADIUS,
                        AC_KEY_MILLISECONDS    : 800,
                    },
                ],
            });

        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.1,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 1500,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 1,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 500,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 1,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 800,
                    },
                ],
            });

        this.lineWidth =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 150,
                        AC_KEY_END_VALUE       : BIG_OUTSIDE_END_LINE_WIDTH,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
    }
    getIsRadiusDecrease() {
        let is_r_decrease =  this.radius.getNowAnimationIndex() != 0;
        return is_r_decrease && this.radius.getValue() <= 800;
    }
    getIsOpacityDecrease() {
        let is_opcity_decrease = this.opcity.getNowAnimationIndex() === 2;
        return is_opcity_decrease;
    }
    _draw() {
        this.radius.beginUpdateAndUpdateValue();
        this.lineWidth.beginUpdateAndUpdateValue();;
        this.opcity.beginUpdateAndUpdateValue();;

        this.context.shadowColor = this.getShadowColor();
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        arcWrap({
            context         : this.context,
            y               : CENTER_Y,
            radius          : this.radius.getValue(),
        });
        this.context.fillStyle = "rgba(0,0,0,0)";
        this.context.strokeStyle = this.getColor(this.opcity.getValue());
        this.context.lineWidth = this.lineWidth.getValue();
        this.context.fill();
        this.context.stroke();
    }
}

const BIG_INSIDE_CRCLE_RADIUS = 50;
class BigInsideCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.radius =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 300,
                        AC_KEY_END_VALUE       : BIG_INSIDE_CRCLE_RADIUS,
                        AC_KEY_MILLISECONDS    : 800,
                    },
                ],
            });
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.1,
                        AC_KEY_END_VALUE       : 1,
                        AC_KEY_MILLISECONDS    : 1500,
                    },
                ],
            });
    }
    _draw() {
        this.radius.beginUpdateAndUpdateValue();
        this.opcity.beginUpdateAndUpdateValue();

        // this.context.beginPath();
        this.context.shadowColor = this.getShadowColor();
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;
        arcWrap({
            context         : this.context,
            y               : CENTER_Y,
            radius          : this.radius.getValue(),
        });
        this.context.fillStyle = this.getColor(this.opcity.getValue());
        this.context.fill();
    }
}

class SmallTranslucentCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 0.0,
                        AC_KEY_END_VALUE       : 0.1,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
    }
    _draw() {
        this.opcity.beginUpdateAndUpdateValue();

        this.context.shadowColor    = this.getShadowColor();
        this.context.shadowOffsetX  = 0;
        this.context.shadowOffsetY  = 0;
        this.context.shadowBlur     = 15;

        this.context.stroke();
        this.context.strokeStyle = this.getColor(this.opcity.getValue());
        this.context.lineWidth = 10;

        arcWrap({
            context         : this.context,
            y               : CENTER_Y,
            radius          : BIG_INSIDE_CRCLE_RADIUS + 7 + this.context.lineWidth,
        });

        this.context.stroke();
    }
}
const BIG_TRANSLUCENT_CRCLE_RADIUS = 140;
const BIG_TRANSLUCENT_CRCLE_LINE_WIDTH = 40;
class BigTranslucentCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 2000,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 0.0,
                        AC_KEY_END_VALUE       : 0.1,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
    }
    _draw() {
        this.opcity.beginUpdateAndUpdateValue();

        // this.context.beginPath();
        this.context.shadowColor    = this.getShadowColor();
        this.context.shadowOffsetX  = 0;
        this.context.shadowOffsetY  = 0;
        this.context.shadowBlur     = 15;

        this.context.stroke();
        this.context.strokeStyle = this.getColor(this.opcity.getValue());
        this.context.lineWidth = BIG_TRANSLUCENT_CRCLE_LINE_WIDTH;

        arcWrap({
            context         : this.context,
            y               : CENTER_Y,
            radius          : BIG_TRANSLUCENT_CRCLE_RADIUS,
            startAngle      : 110 * Math.PI / 180,
            endAngle        : 70 * Math.PI / 180,
        });

        this.context.stroke();
    }
}


class TopRightSmallCrcle extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        let move_along_radius = 250;
        this.left_x =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_CALLBACK :  (x) => { return Math.round(CENTER_X - move_along_radius *  Math.cos((x) * Math.PI / 180)); },
                        AC_KEY_BEGIN_VALUE     : 90,
                        AC_KEY_END_VALUE       : -30,
                        AC_KEY_MILLISECONDS    : 750,
                    },
                ],
            });
        this.radiusight_x =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_CALLBACK :  (x) => { return Math.round(CENTER_X + move_along_radius * Math.cos((x) * Math.PI / 180)); },
                        AC_KEY_BEGIN_VALUE     : 90,
                        AC_KEY_END_VALUE       : -30,
                        AC_KEY_MILLISECONDS    : 750,
                    },
                ],
            });
        this.y =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_CALLBACK : (y) => { return Math.round(CENTER_Y - move_along_radius * Math.sin((y) * Math.PI / 180 )) },
                        AC_KEY_BEGIN_VALUE     : 90,
                        AC_KEY_END_VALUE       : -30,
                        AC_KEY_MILLISECONDS    : 750,
                    },
                ],
            });
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.0,
                        AC_KEY_END_VALUE       : 1.0,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
    }
    _draw() {
        this.left_x.beginUpdateAndUpdateValue();
        this.radiusight_x.beginUpdateAndUpdateValue();
        this.y.beginUpdateAndUpdateValue();
        this.opcity.beginUpdateAndUpdateValue();

        // this.context.beginPath();
        this.context.shadowColor = this.getShadowColor();
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;

        arcWrap({
            context         : this.context,
            x               : this.radiusight_x.getValue(),
            y               : this.y.getValue(),
            radius          : SMALL_CIRCLE_RADIUS,
        });
        arcWrap({
            context         : this.context,
            x               : this.left_x.getValue(),
            y               : this.y.getValue(),
            radius          : SMALL_CIRCLE_RADIUS,
        });
        this.context.fillStyle = this.getColor(this.opcity.getValue());
        this.context.fill();
    }
}


class AngleBrackets extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        let triangle_vertex = 225;
        this.left_x =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 1,
                        AC_KEY_END_VALUE       : CENTER_X - triangle_vertex,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
        this.radiusight_x =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : DISPLAY_WIDTH,
                        AC_KEY_END_VALUE       : CENTER_X + triangle_vertex,
                        AC_KEY_MILLISECONDS    : 1000,
                    },
                ],
            });
        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.0,
                        AC_KEY_END_VALUE       : 1.0,
                        AC_KEY_MILLISECONDS    : 1500,
                    },
                ],
            });
    }
    _draw() {
        this.left_x.beginUpdateAndUpdateValue();
        this.radiusight_x.beginUpdateAndUpdateValue();
        this.opcity.beginUpdateAndUpdateValue();

        // this.context.beginPath();
        this.context.shadowColor = this.getShadowColor();
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;

        let radius  = 20;
        let i_max   = 25;
        let left_x  = Math.round(this.left_x.getValue());
        let right_x = Math.round(this.radiusight_x.getValue());
        let y       = CENTER_Y;
        let sqrt_r   = Math.sqrt(radius);
        for(let i = 0; i <= i_max; i++) {
            let right_arc_x     = Math.round(right_x - sqrt_r * i);
            let left_arc_x      = Math.round(left_x + sqrt_r * i);
            let top_arc_y       = Math.round(y - sqrt_r * i);
            let bottom_arc_y    = Math.round(y + sqrt_r * i);
            moveToWrap({
                context         : this.context,
                x               : right_arc_x,
                y               : top_arc_y,
            });
            arcWrap({
                context         : this.context,
                x               : right_arc_x,
                y               : top_arc_y,
                radius          : radius,
            });
            moveToWrap({
                context         : this.context,
                x               : right_arc_x,
                y               : bottom_arc_y,
            });
            arcWrap({
                context         : this.context,
                x               : right_arc_x,
                y               : bottom_arc_y,
                radius          : radius,
            });
            moveToWrap({
                context         : this.context,
                x               : left_arc_x,
                y               : top_arc_y,
            });
            arcWrap({
                context         : this.context,
                x               : left_arc_x,
                y               : top_arc_y,
                radius          : radius,
            });
            moveToWrap({
                context         : this.context,
                x               : left_arc_x,
                y               : bottom_arc_y,
            });
            arcWrap({
                context         : this.context,
                x               : left_arc_x,
                y               : bottom_arc_y,
                radius          : radius,
            });
        }
        this.context.fillStyle = this.getColor(this.opcity.getValue());
        this.context.fill();
    }
}

const PAI_LINE_LENGTH = 80;
class Pai extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.y =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0,
                        AC_KEY_END_VALUE       : PAI_LINE_LENGTH,
                        AC_KEY_MILLISECONDS    : 500,
                    },
                ],
            });

        this.opcity =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 0.0,
                        AC_KEY_END_VALUE       : 1.0,
                        AC_KEY_MILLISECONDS    : 800,
                    },
                ],
            });
        this.angle =
            new AnimationController({
                animation_define_sets : [
                    {
                        AC_KEY_BEGIN_VALUE     : 180,
                        AC_KEY_END_VALUE       : 180,
                        AC_KEY_MILLISECONDS    : 400,
                    },
                    {
                        AC_KEY_BEGIN_VALUE     : 180,
                        AC_KEY_END_VALUE       : 0,
                        AC_KEY_MILLISECONDS    : 400,
                    },
                ],
            });
    }
    _draw() {
        this.angle.beginUpdateAndUpdateValue();
        this.y.beginUpdateAndUpdateValue();
        this.opcity.beginUpdateAndUpdateValue();

        // this.context.beginPath();
        this.context.shadowColor = this.getShadowColor();
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowBlur = 15;

        // this.context.fillStyle  = "rgba(0,0,0,0)";
        this.context.strokeStyle = this.getColor(this.opcity.getValue());
        this.context.lineWidth = BIG_OUTSIDE_END_LINE_WIDTH;
        this.context.lineCap = "round";
        let now_y = this.y.getValue();
        arcWrap({
            context         : this.context,
            x               : CENTER_X,
            y               : CENTER_Y,
            radius          : BIG_OUTSIDE_END_RADIUS,
            startAngle      : 120 * Math.PI / 180,
            endAngle        : 60 * Math.PI / 180,
        });
        let cos_120 = Math.cos(120 * Math.PI / 180);
        let sin_120 = Math.sin(120 * Math.PI / 180);
        let cos_60  = Math.cos(60 * Math.PI / 180);
        let sin_60  = Math.sin(60 * Math.PI / 180);
        moveToWrap({
            context : this.context,
            x   : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_120),
            y   : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_120),
        });
        lineToWrap({
            context : this.context,
            x   : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_120),
            y   : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_120 + now_y),
        });
        moveToWrap({
            context : this.context,
            x   : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_60),
            y   : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_60),
        });
        lineToWrap({
            context : this.context,
            x   : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_60),
            y   : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_60 + now_y),
        });

        let foot_radius = 50;
        let now_angle = this.angle.getValue();
        moveToWrap({
            context : this.context,
            x   : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_120),
            y   : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_120 + now_y),
        });
        arcWrap({
            context         : this.context,
            x               : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_120 - foot_radius),
            y               : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_120 + now_y),
            radius          : foot_radius,
            startAngle      : 0 * Math.PI / 180,
            endAngle        : (180 - now_angle) * Math.PI / 180,
        });
        moveToWrap({
            context : this.context,
            x   : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_60),
            y   : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_60 + now_y),
        });
        arcWrap({
            context         : this.context,
            x               : Math.round(CENTER_X + BIG_OUTSIDE_END_RADIUS * cos_60 + foot_radius),
            y               : Math.round(CENTER_Y + BIG_OUTSIDE_END_RADIUS * sin_60 + now_y),
            radius          : foot_radius,
            startAngle      : 180 * Math.PI / 180,
            endAngle        : now_angle * Math.PI / 180,
            anticlockwise   : true,
        });
        this.context.stroke();
    }
}

class StartLainOsCombine extends StartLainOsAnimation {
    constructor(back_canvases) {
        super(back_canvases);
        this.back                   = new DrawBack(back_canvases);
        this.top_small_crcle        = new TopSmallCrcle(back_canvases);
        this.bottom_small_crcle     = new BottomSmallCrcle(back_canvases);
        this.bottom_slanting_crcle  = new BottomSlantingCrcle(back_canvases);
        this.big_outside_crcle      = new BigOutsideCrcle(back_canvases);
        this.big_inside_crcle       = new BigInsideCrcle(back_canvases);
        this.small_translucen_crcle = new SmallTranslucentCrcle(back_canvases);
        this.big_translucen_crcle   = new BigTranslucentCrcle(back_canvases);
        this.top_right_small_crcle  = new TopRightSmallCrcle(back_canvases);
        this.angle_brackets         = new AngleBrackets(back_canvases);
        this.pai                    = new Pai(back_canvases);
    }
    _draw() {
        this.back.draw();
        this.top_small_crcle.draw();
        if (this.top_small_crcle.getIsYCompleted()) {
            this.bottom_small_crcle.draw();
            this.bottom_slanting_crcle.draw();
        }

        if(this.bottom_slanting_crcle.getIsYandScaleComplted()) {
            this.big_outside_crcle.draw();
            this.angle_brackets.draw();
        }

        if(this.big_outside_crcle.getIsRadiusDecrease()) {
            this.big_inside_crcle.draw();
            this.small_translucen_crcle.draw();
            this.big_translucen_crcle.draw();
            this.top_right_small_crcle.draw();
        }

        if(this.big_outside_crcle.getIsOpacityDecrease()){
            this.pai.draw();
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
        let start_lain_os_combine = new StartLainOsCombine(canvases);
        let draws = function() {
            double_buffering_canvas.beginDraw();
            start_lain_os_combine.draw();
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


