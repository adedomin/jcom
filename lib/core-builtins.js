/*
 * Copyright (C) 2016  prussian <genunrest@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = {
    echo: {
        func: (vars, args, string, cb) => {
            cb(null, args.join(' ')+'\n')
        }
    },
    passthru: {
        func: (vars, args, string, cb) => {
            cb(null, string)
        }
    },
    json: {
        func: (vars, args, string, cb) => {
            if ((args[0] == '-V' || args[0] == '--to-var') && 
                args[1]) {

                try {
                    vars[args[1]] = JSON.parse(string)
                    return cb(null, string)
                }
                catch (e) {
                    return cb(null, e.toString())
                }
            }
            else if (args[0] == '--from-var' && args[1]){
                try {
                    return cb(null, JSON.stringify(vars[args[1]]))
                }
                catch (e) {
                    return cb(null, e.toString())
                }
            }
            else {
                args[0] == '-h' 
            }

            if (args[0] == '-h') {
                cb(null, `json: help
                    save to variable using --to-var varname
                        note that this function will passthrough with this opt
                    emit parsed javascript object using --from-var varname
                    -h outputs this message`
                )
            }
        }
    },
    json2: {
        func: (vars, args, string, cb) => {
            var flat = (obj, path) => {
                if (obj instanceof Array) {
                    obj.forEach((val, index) => {
                        cb(null, `${path}[${index}]/${val}`+'\n', true)
                    })
                }
                else if (obj instanceof Object) {
                    Object.keys(obj).forEach(key => {
                        flat(obj[key], `${path}/${key}`)
                    })
                }
                else {
                    cb(null, `${path}/${obj}`+'\n', true)
                }
            }

            try {
                string = JSON.parse(string)
            }
            catch (e) {
                return cb(null, '')
            } 
            
            flat(string, '')
            cb(null, '')
        }
    }
}
