function show_runtime() {
    if (document.getElementById("webtime") == null) {
        return false;
    } else {
        window.setTimeout("show_runtime()", 1000);
        var X = new Date("7/10/2019 23:59:59");
        var Y = new Date();
        var T = (Y.getTime() - X.getTime());
        var M = 24 * 60 * 60 * 1000;
        var a = T / M;
        var A = Math.floor(a);
        var b = (a - A) * 24;
        var B = Math.floor(b);
        var c = (b - B) * 60;
        var C = Math.floor((b - B) * 60);
        var D = Math.floor((c - C) * 60);
        document.getElementById("webtime").innerHTML = "已运行: " + A + "天" + B + "小时" + C + "分" + D + "秒"
    }
}
var colortap = function(r) {
    function t() {
        return b[Math.floor(Math.random() * b.length)]
    }
    function e() {
        return String.fromCharCode(94 * Math.random() + 33)
    }
    function n(r) {
        for (var n = document.createDocumentFragment(), i = 0; r > i; i++) {
            var l = document.createElement("span");
            l.textContent = e(),
            l.style.color = t(),
            n.appendChild(l)
        }
        return n;
    }
    function i() {
        var t = o[c.skillI];
        c.step ? c.step--:(c.step = g, c.prefixP < l.length ? (c.prefixP >= 0 && (c.text += l[c.prefixP]), c.prefixP++) : "forward" === c.direction ? c.skillP < t.length ? (c.text += t[c.skillP], c.skillP++) : c.delay ? c.delay--:(c.direction = "backward", c.delay = a) : c.skillP > 0 ? (c.text = c.text.slice(0, -1), c.skillP--) : (c.skillI = (c.skillI + 1) % o.length, c.direction = "forward")),
        r.textContent = c.text,
        r.appendChild(n(c.prefixP < l.length ? Math.min(s, s + c.prefixP) : Math.min(s, t.length - c.skillP))),
        setTimeout(i, d)
    }
    var l = "",
    o = ["醒亦念卿，梦亦念卿", "频繁记录，只因生活和你太值得", "孜孜不倦，认真且怂"].map(function(r) {
        return r + ""
    }),
    a = 2,
    g = 1,
    s = 5,
    d = 75,
    b = ["rgb(110,64,170)", "rgb(150,61,179)", "rgb(191,60,175)", "rgb(228,65,157)", "rgb(254,75,131)", "rgb(255,94,99)", "rgb(255,120,71)", "rgb(251,150,51)", "rgb(226,183,47)", "rgb(198,214,60)", "rgb(175,240,91)", "rgb(127,246,88)", "rgb(82,246,103)", "rgb(48,239,130)", "rgb(29,223,163)", "rgb(26,199,194)", "rgb(35,171,216)", "rgb(54,140,225)", "rgb(76,110,219)", "rgb(96,84,200)"],
    c = {
        text: "",
        prefixP: -s,
        skillI: 0,
        skillP: 0,
        direction: "forward",
        delay: a,
        step: g
    };
    i()
};
function unmouse() {
    document.onkeydown = document.onkeyup = document.onkeypress = function(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && (e.keyCode == 123 || (e.keyCode == 116 && e.type != 'keypress'))) {
            e.returnValue = false;
            return (false);
        }
    }
}
function dark() {
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    var n, e, i, h, t = .05,
    s = document.getElementById("universe"),
    o = !0,
    a = "180,184,240",
    r = "226,225,142",
    d = "226,225,224",
    c = [];
    function f() {
        n = window.innerWidth,
        e = window.innerHeight,
        i = .216 * n,
        s.setAttribute("width", n),
        s.setAttribute("height", e)
    }
    function u() {
        h.clearRect(0, 0, n, e);
        for (var t = c.length,
        i = 0; i < t; i++) {
            var s = c[i];
            s.move(),
            s.fadeIn(),
            s.fadeOut(),
            s.draw()
        }
    }
    function y() {
        this.reset = function() {
            this.giant = m(3),
            this.comet = !this.giant && !o && m(10),
            this.x = l(0, n - 10),
            this.y = l(0, e),
            this.r = l(1.1, 2.6),
            this.dx = l(t, 6 * t) + (this.comet + 1 - 1) * t * l(50, 120) + 2 * t,
            this.dy = -l(t, 6 * t) - (this.comet + 1 - 1) * t * l(50, 120),
            this.fadingOut = null,
            this.fadingIn = !0,
            this.opacity = 0,
            this.opacityTresh = l(.2, 1 - .4 * (this.comet + 1 - 1)),
            this.do = l(5e-4, .002) + .001 * (this.comet + 1 - 1)
        },
        this.fadeIn = function() {
            this.fadingIn && (this.fadingIn = !(this.opacity > this.opacityTresh), this.opacity += this.do)
        },
        this.fadeOut = function() {
            this.fadingOut && (this.fadingOut = !(this.opacity < 0), this.opacity -= this.do / 2, (this.x > n || this.y < 0) && (this.fadingOut = !1, this.reset()))
        },
        this.draw = function() {
            if (h.beginPath(), this.giant) h.fillStyle = "rgba(" + a + "," + this.opacity + ")",
            h.arc(this.x, this.y, 2, 0, 2 * Math.PI, !1);
            else if (this.comet) {
                h.fillStyle = "rgba(" + d + "," + this.opacity + ")",
                h.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, !1);
                for (var t = 0; t < 30; t++) h.fillStyle = "rgba(" + d + "," + (this.opacity - this.opacity / 20 * t) + ")",
                h.rect(this.x - this.dx / 4 * t, this.y - this.dy / 4 * t - 2, 2, 2),
                h.fill()
            } else h.fillStyle = "rgba(" + r + "," + this.opacity + ")",
            h.rect(this.x, this.y, this.r, this.r);
            h.closePath(),
            h.fill()
        },
        this.move = function() {
            this.x += this.dx,
            this.y += this.dy,
            !1 === this.fadingOut && this.reset(),
            (this.x > n - n / 4 || this.y < 0) && (this.fadingOut = !0)
        },
        setTimeout(function() {
            o = !1
        },
        50)
    }
    function m(t) {
        return Math.floor(1e3 * Math.random()) + 1 < 10 * t
    }
    function l(t, i) {
        return Math.random() * (i - t) + t
    }
    f(),
    window.addEventListener("resize", f, !1),
    function() {
        h = s.getContext("2d");
        for (var t = 0; t < i; t++) c[t] = new y,
        c[t].reset();
        u()
    } (),
    function t() {
        document.getElementsByTagName('html')[0].getAttribute('data-theme') == 'dark' && u(),
        window.requestAnimationFrame(t)
    } ()
};
dark()