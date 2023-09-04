// eslint-disable-next-line
export class ColorUtil {
    constructor(){
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }
    /**
   * Encodes color int into hex code
   * @param color The color as int
   */ static intToHex(color) {
        if (!ColorUtil.validateColor(color)) throw new Error('Invalid color');
        return `#${color.toString(16).padStart(6, '0')}`;
    }
    /**
   * Validates hex color
   * @param color The color to validate
   */ static validateColor(color) {
        if (color < 0 || color > 0xffffff) return false;
        return true;
    }
    /**
   * Resolves RGB color array
   * @param color RGB color array
   */ static resolveRGB(color) {
        return (color[0] << 16) + (color[1] << 8) + color[2];
    }
    /**
   * Resolves hex code
   * @param hexcode The hex code
   */ static resolveHex(hexcode) {
        if (!ColorUtil.isHex(hexcode)) throw new Error('Invalid hex code');
        return parseInt(hexcode.replace('#', ''), 16);
    }
    /**
   * Validates hex code
   * @param hexcode The hex code
   */ static isHex(hexcode) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexcode);
    }
    /** Returns random hex code */ static randomHex() {
        const code = `#${Math.floor(Math.random() * (0xffffff + 1)).toString(16).padStart(6, '0')}`;
        if (!ColorUtil.isHex(code)) return '#000000';
        return code;
    }
    /**
   * Resolves color by name
   * @param color The color name
   */ static resolveColor(color) {
        if (!color) return 0 // eslint-disable-line
        ;
        if (color === 'RANDOM') return Math.floor(Math.random() * (0xffffff + 1));
        return ColorUtil.colorList[color];
    }
    /** Color list */ static get colorList() {
        return {
            // custom list
            DEFAULT: 0x000000,
            WHITE: 0xffffff,
            AQUA: 0x1abc9c,
            GREEN: 0x2ecc71,
            BLUE: 0x3498db,
            YELLOW: 0xffff00,
            PURPLE: 0x9b59b6,
            LUMINOUS_VIVID_PINK: 0xe91e63,
            GOLD: 0xf1c40f,
            ORANGE: 0xe67e22,
            RED: 0xe74c3c,
            GREY: 0x95a5a6,
            NAVY: 0x34495e,
            DARK_AQUA: 0x11806a,
            DARK_GREEN: 0x1f8b4c,
            DARK_BLUE: 0x206694,
            DARK_PURPLE: 0x71368a,
            DARK_VIVID_PINK: 0xad1457,
            DARK_GOLD: 0xc27c0e,
            DARK_ORANGE: 0xa84300,
            DARK_RED: 0x992d22,
            DARK_GREY: 0x979c9f,
            DARKER_GREY: 0x7f8c8d,
            LIGHT_GREY: 0xbcc0c0,
            DARK_NAVY: 0x2c3e50,
            BLURPLE: 0x7289da,
            DARK_BLURPLE: 0x4d5e94,
            GREYPLE: 0x99aab5,
            DARK_BUT_NOT_BLACK: 0x2c2f33,
            NOT_QUITE_BLACK: 0x23272a,
            // css color list
            aliceblue: 0xf0f8ff,
            antiquewhite: 0xfaebd7,
            aqua: 0x00ffff,
            aquamarine: 0x7fffd4,
            azure: 0xf0ffff,
            beige: 0xf5f5dc,
            bisque: 0xffe4c4,
            black: 0x000000,
            blanchedalmond: 0xffebcd,
            blue: 0x0000ff,
            blueviolet: 0x8a2be2,
            brown: 0xa52a2a,
            burlywood: 0xdeb887,
            cadetblue: 0x5f9ea0,
            chartreuse: 0x7fff00,
            chocolate: 0xd2691e,
            coral: 0xff7f50,
            cornflowerblue: 0x6495ed,
            cornsilk: 0xfff8dc,
            crimson: 0xdc143c,
            cyan: 0x00ffff,
            darkblue: 0x00008b,
            darkcyan: 0x008b8b,
            darkgoldenrod: 0xb8860b,
            darkgray: 0xa9a9a9,
            darkgreen: 0x006400,
            darkgrey: 0xa9a9a9,
            darkkhaki: 0xbdb76b,
            darkmagenta: 0x8b008b,
            darkolivegreen: 0x556b2f,
            darkorange: 0xff8c00,
            darkorchid: 0x9932cc,
            darkred: 0x8b0000,
            darksalmon: 0xe9967a,
            darkseagreen: 0x8fbc8f,
            darkslateblue: 0x483d8b,
            darkslategray: 0x2f4f4f,
            darkslategrey: 0x2f4f4f,
            darkturquoise: 0x00ced1,
            darkviolet: 0x9400d3,
            deeppink: 0xff1493,
            deepskyblue: 0x00bfff,
            dimgray: 0x696969,
            dimgrey: 0x696969,
            dodgerblue: 0x1e90ff,
            firebrick: 0xb22222,
            floralwhite: 0xfffaf0,
            forestgreen: 0x228b22,
            fuchsia: 0xff00ff,
            gainsboro: 0xdcdcdc,
            ghostwhite: 0xf8f8ff,
            goldenrod: 0xdaa520,
            gold: 0xffd700,
            gray: 0x808080,
            green: 0x008000,
            greenyellow: 0xadff2f,
            grey: 0x808080,
            honeydew: 0xf0fff0,
            hotpink: 0xff69b4,
            indianred: 0xcd5c5c,
            indigo: 0x4b0082,
            ivory: 0xfffff0,
            khaki: 0xf0e68c,
            lavenderblush: 0xfff0f5,
            lavender: 0xe6e6fa,
            lawngreen: 0x7cfc00,
            lemonchiffon: 0xfffacd,
            lightblue: 0xadd8e6,
            lightcoral: 0xf08080,
            lightcyan: 0xe0ffff,
            lightgoldenrodyellow: 0xfafad2,
            lightgray: 0xd3d3d3,
            lightgreen: 0x90ee90,
            lightgrey: 0xd3d3d3,
            lightpink: 0xffb6c1,
            lightsalmon: 0xffa07a,
            lightseagreen: 0x20b2aa,
            lightskyblue: 0x87cefa,
            lightslategray: 0x778899,
            lightslategrey: 0x778899,
            lightsteelblue: 0xb0c4de,
            lightyellow: 0xffffe0,
            lime: 0x00ff00,
            limegreen: 0x32cd32,
            linen: 0xfaf0e6,
            magenta: 0xff00ff,
            maroon: 0x800000,
            mediumaquamarine: 0x66cdaa,
            mediumblue: 0x0000cd,
            mediumorchid: 0xba55d3,
            mediumpurple: 0x9370db,
            mediumseagreen: 0x3cb371,
            mediumslateblue: 0x7b68ee,
            mediumspringgreen: 0x00fa9a,
            mediumturquoise: 0x48d1cc,
            mediumvioletred: 0xc71585,
            midnightblue: 0x191970,
            mintcream: 0xf5fffa,
            mistyrose: 0xffe4e1,
            moccasin: 0xffe4b5,
            navajowhite: 0xffdead,
            navy: 0x000080,
            oldlace: 0xfdf5e6,
            olive: 0x808000,
            olivedrab: 0x6b8e23,
            orange: 0xffa500,
            orangered: 0xff4500,
            orchid: 0xda70d6,
            palegoldenrod: 0xeee8aa,
            palegreen: 0x98fb98,
            paleturquoise: 0xafeeee,
            palevioletred: 0xdb7093,
            papayawhip: 0xffefd5,
            peachpuff: 0xffdab9,
            peru: 0xcd853f,
            pink: 0xffc0cb,
            plum: 0xdda0dd,
            powderblue: 0xb0e0e6,
            purple: 0x800080,
            rebeccapurple: 0x663399,
            red: 0xff0000,
            rosybrown: 0xbc8f8f,
            royalblue: 0x4169e1,
            saddlebrown: 0x8b4513,
            salmon: 0xfa8072,
            sandybrown: 0xf4a460,
            seagreen: 0x2e8b57,
            seashell: 0xfff5ee,
            sienna: 0xa0522d,
            silver: 0xc0c0c0,
            skyblue: 0x87ceeb,
            slateblue: 0x6a5acd,
            slategray: 0x708090,
            slategrey: 0x708090,
            snow: 0xfffafa,
            springgreen: 0x00ff7f,
            steelblue: 0x4682b4,
            tan: 0xd2b48c,
            teal: 0x008080,
            thistle: 0xd8bfd8,
            tomato: 0xff6347,
            turquoise: 0x40e0d0,
            violet: 0xee82ee,
            wheat: 0xf5deb3,
            white: 0xffffff,
            whitesmoke: 0xf5f5f5,
            yellow: 0xffff00,
            yellowgreen: 0x9acd32
        };
    }
    static toJSON() {
        return ColorUtil.colorList;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL2NvbG9ydXRpbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgaW50ZXJmYWNlIENvbG9ycyB7XG4gIC8vIEN1c3RvbSBsaXN0XG4gIERFRkFVTFQ6IG51bWJlclxuICBXSElURTogbnVtYmVyXG4gIEFRVUE6IG51bWJlclxuICBHUkVFTjogbnVtYmVyXG4gIEJMVUU6IG51bWJlclxuICBZRUxMT1c6IG51bWJlclxuICBQVVJQTEU6IG51bWJlclxuICBMVU1JTk9VU19WSVZJRF9QSU5LOiBudW1iZXJcbiAgR09MRDogbnVtYmVyXG4gIE9SQU5HRTogbnVtYmVyXG4gIFJFRDogbnVtYmVyXG4gIEdSRVk6IG51bWJlclxuICBOQVZZOiBudW1iZXJcbiAgREFSS19BUVVBOiBudW1iZXJcbiAgREFSS19HUkVFTjogbnVtYmVyXG4gIERBUktfQkxVRTogbnVtYmVyXG4gIERBUktfUFVSUExFOiBudW1iZXJcbiAgREFSS19WSVZJRF9QSU5LOiBudW1iZXJcbiAgREFSS19HT0xEOiBudW1iZXJcbiAgREFSS19PUkFOR0U6IG51bWJlclxuICBEQVJLX1JFRDogbnVtYmVyXG4gIERBUktfR1JFWTogbnVtYmVyXG4gIERBUktFUl9HUkVZOiBudW1iZXJcbiAgTElHSFRfR1JFWTogbnVtYmVyXG4gIERBUktfTkFWWTogbnVtYmVyXG4gIEJMVVJQTEU6IG51bWJlclxuICBEQVJLX0JMVVJQTEU6IG51bWJlclxuICBHUkVZUExFOiBudW1iZXJcbiAgREFSS19CVVRfTk9UX0JMQUNLOiBudW1iZXJcbiAgTk9UX1FVSVRFX0JMQUNLOiBudW1iZXJcblxuICAvLyBjc3MgY29sb3IgbGlzdFxuICBhbGljZWJsdWU6IG51bWJlclxuICBhbnRpcXVld2hpdGU6IG51bWJlclxuICBhcXVhOiBudW1iZXJcbiAgYXF1YW1hcmluZTogbnVtYmVyXG4gIGF6dXJlOiBudW1iZXJcbiAgYmVpZ2U6IG51bWJlclxuICBiaXNxdWU6IG51bWJlclxuICBibGFjazogbnVtYmVyXG4gIGJsYW5jaGVkYWxtb25kOiBudW1iZXJcbiAgYmx1ZTogbnVtYmVyXG4gIGJsdWV2aW9sZXQ6IG51bWJlclxuICBicm93bjogbnVtYmVyXG4gIGJ1cmx5d29vZDogbnVtYmVyXG4gIGNhZGV0Ymx1ZTogbnVtYmVyXG4gIGNoYXJ0cmV1c2U6IG51bWJlclxuICBjaG9jb2xhdGU6IG51bWJlclxuICBjb3JhbDogbnVtYmVyXG4gIGNvcm5mbG93ZXJibHVlOiBudW1iZXJcbiAgY29ybnNpbGs6IG51bWJlclxuICBjcmltc29uOiBudW1iZXJcbiAgY3lhbjogbnVtYmVyXG4gIGRhcmtibHVlOiBudW1iZXJcbiAgZGFya2N5YW46IG51bWJlclxuICBkYXJrZ29sZGVucm9kOiBudW1iZXJcbiAgZGFya2dyYXk6IG51bWJlclxuICBkYXJrZ3JlZW46IG51bWJlclxuICBkYXJrZ3JleTogbnVtYmVyXG4gIGRhcmtraGFraTogbnVtYmVyXG4gIGRhcmttYWdlbnRhOiBudW1iZXJcbiAgZGFya29saXZlZ3JlZW46IG51bWJlclxuICBkYXJrb3JhbmdlOiBudW1iZXJcbiAgZGFya29yY2hpZDogbnVtYmVyXG4gIGRhcmtyZWQ6IG51bWJlclxuICBkYXJrc2FsbW9uOiBudW1iZXJcbiAgZGFya3NlYWdyZWVuOiBudW1iZXJcbiAgZGFya3NsYXRlYmx1ZTogbnVtYmVyXG4gIGRhcmtzbGF0ZWdyYXk6IG51bWJlclxuICBkYXJrc2xhdGVncmV5OiBudW1iZXJcbiAgZGFya3R1cnF1b2lzZTogbnVtYmVyXG4gIGRhcmt2aW9sZXQ6IG51bWJlclxuICBkZWVwcGluazogbnVtYmVyXG4gIGRlZXBza3libHVlOiBudW1iZXJcbiAgZGltZ3JheTogbnVtYmVyXG4gIGRpbWdyZXk6IG51bWJlclxuICBkb2RnZXJibHVlOiBudW1iZXJcbiAgZmlyZWJyaWNrOiBudW1iZXJcbiAgZmxvcmFsd2hpdGU6IG51bWJlclxuICBmb3Jlc3RncmVlbjogbnVtYmVyXG4gIGZ1Y2hzaWE6IG51bWJlclxuICBnYWluc2Jvcm86IG51bWJlclxuICBnaG9zdHdoaXRlOiBudW1iZXJcbiAgZ29sZGVucm9kOiBudW1iZXJcbiAgZ29sZDogbnVtYmVyXG4gIGdyYXk6IG51bWJlclxuICBncmVlbjogbnVtYmVyXG4gIGdyZWVueWVsbG93OiBudW1iZXJcbiAgZ3JleTogbnVtYmVyXG4gIGhvbmV5ZGV3OiBudW1iZXJcbiAgaG90cGluazogbnVtYmVyXG4gIGluZGlhbnJlZDogbnVtYmVyXG4gIGluZGlnbzogbnVtYmVyXG4gIGl2b3J5OiBudW1iZXJcbiAga2hha2k6IG51bWJlclxuICBsYXZlbmRlcmJsdXNoOiBudW1iZXJcbiAgbGF2ZW5kZXI6IG51bWJlclxuICBsYXduZ3JlZW46IG51bWJlclxuICBsZW1vbmNoaWZmb246IG51bWJlclxuICBsaWdodGJsdWU6IG51bWJlclxuICBsaWdodGNvcmFsOiBudW1iZXJcbiAgbGlnaHRjeWFuOiBudW1iZXJcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IG51bWJlclxuICBsaWdodGdyYXk6IG51bWJlclxuICBsaWdodGdyZWVuOiBudW1iZXJcbiAgbGlnaHRncmV5OiBudW1iZXJcbiAgbGlnaHRwaW5rOiBudW1iZXJcbiAgbGlnaHRzYWxtb246IG51bWJlclxuICBsaWdodHNlYWdyZWVuOiBudW1iZXJcbiAgbGlnaHRza3libHVlOiBudW1iZXJcbiAgbGlnaHRzbGF0ZWdyYXk6IG51bWJlclxuICBsaWdodHNsYXRlZ3JleTogbnVtYmVyXG4gIGxpZ2h0c3RlZWxibHVlOiBudW1iZXJcbiAgbGlnaHR5ZWxsb3c6IG51bWJlclxuICBsaW1lOiBudW1iZXJcbiAgbGltZWdyZWVuOiBudW1iZXJcbiAgbGluZW46IG51bWJlclxuICBtYWdlbnRhOiBudW1iZXJcbiAgbWFyb29uOiBudW1iZXJcbiAgbWVkaXVtYXF1YW1hcmluZTogbnVtYmVyXG4gIG1lZGl1bWJsdWU6IG51bWJlclxuICBtZWRpdW1vcmNoaWQ6IG51bWJlclxuICBtZWRpdW1wdXJwbGU6IG51bWJlclxuICBtZWRpdW1zZWFncmVlbjogbnVtYmVyXG4gIG1lZGl1bXNsYXRlYmx1ZTogbnVtYmVyXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiBudW1iZXJcbiAgbWVkaXVtdHVycXVvaXNlOiBudW1iZXJcbiAgbWVkaXVtdmlvbGV0cmVkOiBudW1iZXJcbiAgbWlkbmlnaHRibHVlOiBudW1iZXJcbiAgbWludGNyZWFtOiBudW1iZXJcbiAgbWlzdHlyb3NlOiBudW1iZXJcbiAgbW9jY2FzaW46IG51bWJlclxuICBuYXZham93aGl0ZTogbnVtYmVyXG4gIG5hdnk6IG51bWJlclxuICBvbGRsYWNlOiBudW1iZXJcbiAgb2xpdmU6IG51bWJlclxuICBvbGl2ZWRyYWI6IG51bWJlclxuICBvcmFuZ2U6IG51bWJlclxuICBvcmFuZ2VyZWQ6IG51bWJlclxuICBvcmNoaWQ6IG51bWJlclxuICBwYWxlZ29sZGVucm9kOiBudW1iZXJcbiAgcGFsZWdyZWVuOiBudW1iZXJcbiAgcGFsZXR1cnF1b2lzZTogbnVtYmVyXG4gIHBhbGV2aW9sZXRyZWQ6IG51bWJlclxuICBwYXBheWF3aGlwOiBudW1iZXJcbiAgcGVhY2hwdWZmOiBudW1iZXJcbiAgcGVydTogbnVtYmVyXG4gIHBpbms6IG51bWJlclxuICBwbHVtOiBudW1iZXJcbiAgcG93ZGVyYmx1ZTogbnVtYmVyXG4gIHB1cnBsZTogbnVtYmVyXG4gIHJlYmVjY2FwdXJwbGU6IG51bWJlclxuICByZWQ6IG51bWJlclxuICByb3N5YnJvd246IG51bWJlclxuICByb3lhbGJsdWU6IG51bWJlclxuICBzYWRkbGVicm93bjogbnVtYmVyXG4gIHNhbG1vbjogbnVtYmVyXG4gIHNhbmR5YnJvd246IG51bWJlclxuICBzZWFncmVlbjogbnVtYmVyXG4gIHNlYXNoZWxsOiBudW1iZXJcbiAgc2llbm5hOiBudW1iZXJcbiAgc2lsdmVyOiBudW1iZXJcbiAgc2t5Ymx1ZTogbnVtYmVyXG4gIHNsYXRlYmx1ZTogbnVtYmVyXG4gIHNsYXRlZ3JheTogbnVtYmVyXG4gIHNsYXRlZ3JleTogbnVtYmVyXG4gIHNub3c6IG51bWJlclxuICBzcHJpbmdncmVlbjogbnVtYmVyXG4gIHN0ZWVsYmx1ZTogbnVtYmVyXG4gIHRhbjogbnVtYmVyXG4gIHRlYWw6IG51bWJlclxuICB0aGlzdGxlOiBudW1iZXJcbiAgdG9tYXRvOiBudW1iZXJcbiAgdHVycXVvaXNlOiBudW1iZXJcbiAgdmlvbGV0OiBudW1iZXJcbiAgd2hlYXQ6IG51bWJlclxuICB3aGl0ZTogbnVtYmVyXG4gIHdoaXRlc21va2U6IG51bWJlclxuICB5ZWxsb3c6IG51bWJlclxuICB5ZWxsb3dncmVlbjogbnVtYmVyXG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuZXhwb3J0IGNsYXNzIENvbG9yVXRpbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBUaGUgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IGNsYXNzIG1heSBub3QgYmUgaW5zdGFudGlhdGVkIWBcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogRW5jb2RlcyBjb2xvciBpbnQgaW50byBoZXggY29kZVxuICAgKiBAcGFyYW0gY29sb3IgVGhlIGNvbG9yIGFzIGludFxuICAgKi9cbiAgc3RhdGljIGludFRvSGV4KGNvbG9yOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGlmICghQ29sb3JVdGlsLnZhbGlkYXRlQ29sb3IoY29sb3IpKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29sb3InKVxuICAgIHJldHVybiBgIyR7Y29sb3IudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDYsICcwJyl9YFxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyBoZXggY29sb3JcbiAgICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciB0byB2YWxpZGF0ZVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlQ29sb3IoY29sb3I6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmIChjb2xvciA8IDAgfHwgY29sb3IgPiAweGZmZmZmZikgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBSR0IgY29sb3IgYXJyYXlcbiAgICogQHBhcmFtIGNvbG9yIFJHQiBjb2xvciBhcnJheVxuICAgKi9cbiAgc3RhdGljIHJlc29sdmVSR0IoY29sb3I6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSk6IG51bWJlciB7XG4gICAgcmV0dXJuIChjb2xvclswXSA8PCAxNikgKyAoY29sb3JbMV0gPDwgOCkgKyBjb2xvclsyXVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGhleCBjb2RlXG4gICAqIEBwYXJhbSBoZXhjb2RlIFRoZSBoZXggY29kZVxuICAgKi9cbiAgc3RhdGljIHJlc29sdmVIZXgoaGV4Y29kZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBpZiAoIUNvbG9yVXRpbC5pc0hleChoZXhjb2RlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBjb2RlJylcbiAgICByZXR1cm4gcGFyc2VJbnQoaGV4Y29kZS5yZXBsYWNlKCcjJywgJycpLCAxNilcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgaGV4IGNvZGVcbiAgICogQHBhcmFtIGhleGNvZGUgVGhlIGhleCBjb2RlXG4gICAqL1xuICBzdGF0aWMgaXNIZXgoaGV4Y29kZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIC9eIyhbQS1GYS1mMC05XXs2fXxbQS1GYS1mMC05XXszfSkkLy50ZXN0KGhleGNvZGUpXG4gIH1cblxuICAvKiogUmV0dXJucyByYW5kb20gaGV4IGNvZGUgKi9cbiAgc3RhdGljIHJhbmRvbUhleCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNvZGUgPSBgIyR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDB4ZmZmZmZmICsgMSkpXG4gICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAucGFkU3RhcnQoNiwgJzAnKX1gXG4gICAgaWYgKCFDb2xvclV0aWwuaXNIZXgoY29kZSkpIHJldHVybiAnIzAwMDAwMCdcbiAgICByZXR1cm4gY29kZVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGNvbG9yIGJ5IG5hbWVcbiAgICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBuYW1lXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZUNvbG9yKGNvbG9yPzoga2V5b2YgQ29sb3JzIHwgJ1JBTkRPTScpOiBudW1iZXIge1xuICAgIGlmICghY29sb3IpIHJldHVybiAwIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBpZiAoY29sb3IgPT09ICdSQU5ET00nKSByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDB4ZmZmZmZmICsgMSkpXG4gICAgcmV0dXJuIENvbG9yVXRpbC5jb2xvckxpc3RbY29sb3JdXG4gIH1cblxuICAvKiogQ29sb3IgbGlzdCAqL1xuICBzdGF0aWMgZ2V0IGNvbG9yTGlzdCgpOiBDb2xvcnMge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBjdXN0b20gbGlzdFxuICAgICAgREVGQVVMVDogMHgwMDAwMDAsXG4gICAgICBXSElURTogMHhmZmZmZmYsXG4gICAgICBBUVVBOiAweDFhYmM5YyxcbiAgICAgIEdSRUVOOiAweDJlY2M3MSxcbiAgICAgIEJMVUU6IDB4MzQ5OGRiLFxuICAgICAgWUVMTE9XOiAweGZmZmYwMCxcbiAgICAgIFBVUlBMRTogMHg5YjU5YjYsXG4gICAgICBMVU1JTk9VU19WSVZJRF9QSU5LOiAweGU5MWU2MyxcbiAgICAgIEdPTEQ6IDB4ZjFjNDBmLFxuICAgICAgT1JBTkdFOiAweGU2N2UyMixcbiAgICAgIFJFRDogMHhlNzRjM2MsXG4gICAgICBHUkVZOiAweDk1YTVhNixcbiAgICAgIE5BVlk6IDB4MzQ0OTVlLFxuICAgICAgREFSS19BUVVBOiAweDExODA2YSxcbiAgICAgIERBUktfR1JFRU46IDB4MWY4YjRjLFxuICAgICAgREFSS19CTFVFOiAweDIwNjY5NCxcbiAgICAgIERBUktfUFVSUExFOiAweDcxMzY4YSxcbiAgICAgIERBUktfVklWSURfUElOSzogMHhhZDE0NTcsXG4gICAgICBEQVJLX0dPTEQ6IDB4YzI3YzBlLFxuICAgICAgREFSS19PUkFOR0U6IDB4YTg0MzAwLFxuICAgICAgREFSS19SRUQ6IDB4OTkyZDIyLFxuICAgICAgREFSS19HUkVZOiAweDk3OWM5ZixcbiAgICAgIERBUktFUl9HUkVZOiAweDdmOGM4ZCxcbiAgICAgIExJR0hUX0dSRVk6IDB4YmNjMGMwLFxuICAgICAgREFSS19OQVZZOiAweDJjM2U1MCxcbiAgICAgIEJMVVJQTEU6IDB4NzI4OWRhLFxuICAgICAgREFSS19CTFVSUExFOiAweDRkNWU5NCxcbiAgICAgIEdSRVlQTEU6IDB4OTlhYWI1LFxuICAgICAgREFSS19CVVRfTk9UX0JMQUNLOiAweDJjMmYzMyxcbiAgICAgIE5PVF9RVUlURV9CTEFDSzogMHgyMzI3MmEsXG5cbiAgICAgIC8vIGNzcyBjb2xvciBsaXN0XG4gICAgICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICAgICAgYW50aXF1ZXdoaXRlOiAweGZhZWJkNyxcbiAgICAgIGFxdWE6IDB4MDBmZmZmLFxuICAgICAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gICAgICBhenVyZTogMHhmMGZmZmYsXG4gICAgICBiZWlnZTogMHhmNWY1ZGMsXG4gICAgICBiaXNxdWU6IDB4ZmZlNGM0LFxuICAgICAgYmxhY2s6IDB4MDAwMDAwLFxuICAgICAgYmxhbmNoZWRhbG1vbmQ6IDB4ZmZlYmNkLFxuICAgICAgYmx1ZTogMHgwMDAwZmYsXG4gICAgICBibHVldmlvbGV0OiAweDhhMmJlMixcbiAgICAgIGJyb3duOiAweGE1MmEyYSxcbiAgICAgIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gICAgICBjYWRldGJsdWU6IDB4NWY5ZWEwLFxuICAgICAgY2hhcnRyZXVzZTogMHg3ZmZmMDAsXG4gICAgICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICAgICAgY29yYWw6IDB4ZmY3ZjUwLFxuICAgICAgY29ybmZsb3dlcmJsdWU6IDB4NjQ5NWVkLFxuICAgICAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICAgICAgY3JpbXNvbjogMHhkYzE0M2MsXG4gICAgICBjeWFuOiAweDAwZmZmZixcbiAgICAgIGRhcmtibHVlOiAweDAwMDA4YixcbiAgICAgIGRhcmtjeWFuOiAweDAwOGI4YixcbiAgICAgIGRhcmtnb2xkZW5yb2Q6IDB4Yjg4NjBiLFxuICAgICAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICAgICAgZGFya2dyZWVuOiAweDAwNjQwMCxcbiAgICAgIGRhcmtncmV5OiAweGE5YTlhOSxcbiAgICAgIGRhcmtraGFraTogMHhiZGI3NmIsXG4gICAgICBkYXJrbWFnZW50YTogMHg4YjAwOGIsXG4gICAgICBkYXJrb2xpdmVncmVlbjogMHg1NTZiMmYsXG4gICAgICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgICAgIGRhcmtvcmNoaWQ6IDB4OTkzMmNjLFxuICAgICAgZGFya3JlZDogMHg4YjAwMDAsXG4gICAgICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgICAgIGRhcmtzZWFncmVlbjogMHg4ZmJjOGYsXG4gICAgICBkYXJrc2xhdGVibHVlOiAweDQ4M2Q4YixcbiAgICAgIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICAgICAgZGFya3NsYXRlZ3JleTogMHgyZjRmNGYsXG4gICAgICBkYXJrdHVycXVvaXNlOiAweDAwY2VkMSxcbiAgICAgIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICAgICAgZGVlcHBpbms6IDB4ZmYxNDkzLFxuICAgICAgZGVlcHNreWJsdWU6IDB4MDBiZmZmLFxuICAgICAgZGltZ3JheTogMHg2OTY5NjksXG4gICAgICBkaW1ncmV5OiAweDY5Njk2OSxcbiAgICAgIGRvZGdlcmJsdWU6IDB4MWU5MGZmLFxuICAgICAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgICAgIGZsb3JhbHdoaXRlOiAweGZmZmFmMCxcbiAgICAgIGZvcmVzdGdyZWVuOiAweDIyOGIyMixcbiAgICAgIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICAgICAgZ2FpbnNib3JvOiAweGRjZGNkYyxcbiAgICAgIGdob3N0d2hpdGU6IDB4ZjhmOGZmLFxuICAgICAgZ29sZGVucm9kOiAweGRhYTUyMCxcbiAgICAgIGdvbGQ6IDB4ZmZkNzAwLFxuICAgICAgZ3JheTogMHg4MDgwODAsXG4gICAgICBncmVlbjogMHgwMDgwMDAsXG4gICAgICBncmVlbnllbGxvdzogMHhhZGZmMmYsXG4gICAgICBncmV5OiAweDgwODA4MCxcbiAgICAgIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgICAgIGhvdHBpbms6IDB4ZmY2OWI0LFxuICAgICAgaW5kaWFucmVkOiAweGNkNWM1YyxcbiAgICAgIGluZGlnbzogMHg0YjAwODIsXG4gICAgICBpdm9yeTogMHhmZmZmZjAsXG4gICAgICBraGFraTogMHhmMGU2OGMsXG4gICAgICBsYXZlbmRlcmJsdXNoOiAweGZmZjBmNSxcbiAgICAgIGxhdmVuZGVyOiAweGU2ZTZmYSxcbiAgICAgIGxhd25ncmVlbjogMHg3Y2ZjMDAsXG4gICAgICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICAgICAgbGlnaHRibHVlOiAweGFkZDhlNixcbiAgICAgIGxpZ2h0Y29yYWw6IDB4ZjA4MDgwLFxuICAgICAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiAweGZhZmFkMixcbiAgICAgIGxpZ2h0Z3JheTogMHhkM2QzZDMsXG4gICAgICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgICAgIGxpZ2h0Z3JleTogMHhkM2QzZDMsXG4gICAgICBsaWdodHBpbms6IDB4ZmZiNmMxLFxuICAgICAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICAgICAgbGlnaHRzZWFncmVlbjogMHgyMGIyYWEsXG4gICAgICBsaWdodHNreWJsdWU6IDB4ODdjZWZhLFxuICAgICAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICAgICAgbGlnaHRzbGF0ZWdyZXk6IDB4Nzc4ODk5LFxuICAgICAgbGlnaHRzdGVlbGJsdWU6IDB4YjBjNGRlLFxuICAgICAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICAgICAgbGltZTogMHgwMGZmMDAsXG4gICAgICBsaW1lZ3JlZW46IDB4MzJjZDMyLFxuICAgICAgbGluZW46IDB4ZmFmMGU2LFxuICAgICAgbWFnZW50YTogMHhmZjAwZmYsXG4gICAgICBtYXJvb246IDB4ODAwMDAwLFxuICAgICAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gICAgICBtZWRpdW1ibHVlOiAweDAwMDBjZCxcbiAgICAgIG1lZGl1bW9yY2hpZDogMHhiYTU1ZDMsXG4gICAgICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICAgICAgbWVkaXVtc2VhZ3JlZW46IDB4M2NiMzcxLFxuICAgICAgbWVkaXVtc2xhdGVibHVlOiAweDdiNjhlZSxcbiAgICAgIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgICAgIG1lZGl1bXR1cnF1b2lzZTogMHg0OGQxY2MsXG4gICAgICBtZWRpdW12aW9sZXRyZWQ6IDB4YzcxNTg1LFxuICAgICAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgICAgIG1pbnRjcmVhbTogMHhmNWZmZmEsXG4gICAgICBtaXN0eXJvc2U6IDB4ZmZlNGUxLFxuICAgICAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICAgICAgbmF2YWpvd2hpdGU6IDB4ZmZkZWFkLFxuICAgICAgbmF2eTogMHgwMDAwODAsXG4gICAgICBvbGRsYWNlOiAweGZkZjVlNixcbiAgICAgIG9saXZlOiAweDgwODAwMCxcbiAgICAgIG9saXZlZHJhYjogMHg2YjhlMjMsXG4gICAgICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICAgICAgb3JhbmdlcmVkOiAweGZmNDUwMCxcbiAgICAgIG9yY2hpZDogMHhkYTcwZDYsXG4gICAgICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgICAgIHBhbGVncmVlbjogMHg5OGZiOTgsXG4gICAgICBwYWxldHVycXVvaXNlOiAweGFmZWVlZSxcbiAgICAgIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICAgICAgcGFwYXlhd2hpcDogMHhmZmVmZDUsXG4gICAgICBwZWFjaHB1ZmY6IDB4ZmZkYWI5LFxuICAgICAgcGVydTogMHhjZDg1M2YsXG4gICAgICBwaW5rOiAweGZmYzBjYixcbiAgICAgIHBsdW06IDB4ZGRhMGRkLFxuICAgICAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gICAgICBwdXJwbGU6IDB4ODAwMDgwLFxuICAgICAgcmViZWNjYXB1cnBsZTogMHg2NjMzOTksXG4gICAgICByZWQ6IDB4ZmYwMDAwLFxuICAgICAgcm9zeWJyb3duOiAweGJjOGY4ZixcbiAgICAgIHJveWFsYmx1ZTogMHg0MTY5ZTEsXG4gICAgICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gICAgICBzYWxtb246IDB4ZmE4MDcyLFxuICAgICAgc2FuZHlicm93bjogMHhmNGE0NjAsXG4gICAgICBzZWFncmVlbjogMHgyZThiNTcsXG4gICAgICBzZWFzaGVsbDogMHhmZmY1ZWUsXG4gICAgICBzaWVubmE6IDB4YTA1MjJkLFxuICAgICAgc2lsdmVyOiAweGMwYzBjMCxcbiAgICAgIHNreWJsdWU6IDB4ODdjZWViLFxuICAgICAgc2xhdGVibHVlOiAweDZhNWFjZCxcbiAgICAgIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gICAgICBzbGF0ZWdyZXk6IDB4NzA4MDkwLFxuICAgICAgc25vdzogMHhmZmZhZmEsXG4gICAgICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gICAgICBzdGVlbGJsdWU6IDB4NDY4MmI0LFxuICAgICAgdGFuOiAweGQyYjQ4YyxcbiAgICAgIHRlYWw6IDB4MDA4MDgwLFxuICAgICAgdGhpc3RsZTogMHhkOGJmZDgsXG4gICAgICB0b21hdG86IDB4ZmY2MzQ3LFxuICAgICAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgICAgIHZpb2xldDogMHhlZTgyZWUsXG4gICAgICB3aGVhdDogMHhmNWRlYjMsXG4gICAgICB3aGl0ZTogMHhmZmZmZmYsXG4gICAgICB3aGl0ZXNtb2tlOiAweGY1ZjVmNSxcbiAgICAgIHllbGxvdzogMHhmZmZmMDAsXG4gICAgICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgdG9KU09OKCk6IENvbG9ycyB7XG4gICAgcmV0dXJuIENvbG9yVXRpbC5jb2xvckxpc3RcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXdMQSwyQkFBMkI7QUFDM0IsT0FBTyxNQUFNO0lBQ1gsYUFBYztRQUNaLE1BQU0sSUFBSSxNQUNSLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLEVBQzlEO0lBQ0g7SUFFQTs7O0dBR0MsR0FDRCxPQUFPLFNBQVMsS0FBYSxFQUFVO1FBQ3JDLElBQUksQ0FBQyxVQUFVLGFBQWEsQ0FBQyxRQUFRLE1BQU0sSUFBSSxNQUFNLGlCQUFnQjtRQUNyRSxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ2xEO0lBRUE7OztHQUdDLEdBQ0QsT0FBTyxjQUFjLEtBQWEsRUFBVztRQUMzQyxJQUFJLFFBQVEsS0FBSyxRQUFRLFVBQVUsT0FBTyxLQUFLO1FBQy9DLE9BQU8sSUFBSTtJQUNiO0lBRUE7OztHQUdDLEdBQ0QsT0FBTyxXQUFXLEtBQStCLEVBQVU7UUFDekQsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7SUFDdEQ7SUFFQTs7O0dBR0MsR0FDRCxPQUFPLFdBQVcsT0FBZSxFQUFVO1FBQ3pDLElBQUksQ0FBQyxVQUFVLEtBQUssQ0FBQyxVQUFVLE1BQU0sSUFBSSxNQUFNLG9CQUFtQjtRQUNsRSxPQUFPLFNBQVMsUUFBUSxPQUFPLENBQUMsS0FBSyxLQUFLO0lBQzVDO0lBRUE7OztHQUdDLEdBQ0QsT0FBTyxNQUFNLE9BQWUsRUFBVztRQUNyQyxPQUFPLHFDQUFxQyxJQUFJLENBQUM7SUFD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