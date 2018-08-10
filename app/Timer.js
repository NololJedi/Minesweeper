"use strict";
import jQuery from "jquery";

window.$ = window.jQuery = jQuery;

export default class Timer {
    constructor() {
        this.time = 0;
        this.interval = 0;
    }

    reset() {
        clearInterval(this.interval);
        this.time = 0;
    }

    start() {
        let time = this.time;
        this.interval = setInterval(function () {
            time++;
            let minutes = Math.floor(time / 10 / 60 % 60);
            let seconds = Math.floor(time / 10 % 60);
            let hour = Math.floor(time / 10 / 60 / 60 % 60);
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            $("#viewer").text(hour + ':' + minutes + ':' + seconds);
        }, 100);
    }
}