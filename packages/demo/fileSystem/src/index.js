const {fileOpen, supported} = require("browser-fs-access");
const { FileSystemInterface } = require("common-file-system");


(async () => {
    if (supported) {
        console.log('Using native File System Access API.');
    } else {
        console.log('Using the fallback implementation.');
    }
})();

Vue.mixin({
    methods: {
        isFile: (object) => {
            if (object === undefined) return false;
            if (object === null) return false;
            return (object.constructor !== Object);
        },
        log(msg){
            console.log(msg);
        },
        openFiles: () => {
            return fileOpen({
                startIn: 'downloads',
                multiple: true,
            });
        }
    }
});

Vue.component('folder-viewer', {
    props: ['name','content'],
    data: function () {
        return {
            isOpen: false
        }
    },
    template: `
            <div style="border: solid black 1px; margin: 10px 0">
                <a>{{name}}</a>

                <button v-on:click="isOpen = !isOpen">New Folder</button>
                <button v-on:click="() => {
                    openFiles().then(files => {
                        files.forEach((file) => {
                            log(file);
                            this.$set(content, file.name, file)
                        });
                    }).catch(() => {
                        log('No file selected');
                    });
                }">Add Files</button>
                <input-dialogue :submit-callback="(value) => {this.$set(content, value, {}); this.isOpen = false}" :cancel-callback="() => this.isOpen = false" :is-open="isOpen"/>

                <ul>
                    <li v-for="[name, object] in Object.entries(content).filter(([name, object]) => this.isFile(object))">{{ name }} {{ object.size }}</li>
                </ul>
                <ul>
                    <li v-for="[name, object] in Object.entries(content).filter(([name, object]) => !this.isFile(object))">
                        <folder-viewer :name="name" :content="object"></folder-viewer>
                    </li>
                </ul>
            </div>
        `
})

Vue.component('input-dialogue', {
    data: function () {
        return {
            value: ""
        }
    },
    props: ['submitCallback', 'cancelCallback', "isOpen"],
    template: `
            <div v-if="isOpen" class="input-dialogue">
                <div class="backdrop"></div>
                <div class="dialogue-box">
                    <div>
                        <input v-model="value" type="text" placeholder="folder name">
                        <br>
                        <button v-on:click="() => submitCallback(value)">OK</button>
                        <button v-on:click="cancelCallback">cancel</button>
                    </div>
                </div>
            </div>
        `
})

let app = new Vue({
    el: '#app',
    data: {
        fs: {
            // file1: new File([], "file1"),
            // file2: new File([], "file2"),
            // file3: new File([], "file3"),
            // folder1: {
            //     fileA: new File([], "file3"),
            //     fileB: new File([], "fileB"),
            //     fileC: new File([], "filC"),
            //     fileD: new File([], "fileD"),
            //     fileE: new File([], "fileE"),
            //     folder1: {
            //         file1: new File([], "file1"),
            //         file2: new File([], "file2"),
            //     },
            //     folder2: {
            //         file1: new File([], "file1"),
            //         file2: new File([], "file2"),
            //     }
            // }
        }
    },
    methods: {
        isFile: (object) => {
            if(object === undefined) return false;
            if(object === null) return false;
            return (object.constructor !== Object);
        },
        getFileStructure: function () {
            return this.fs;
        }
    }
});


let b = document.getElementById("read");

b.addEventListener("click", () => {
    readFile();
});

function isFile(object) {
    if (object === undefined) return false;
    if (object === null) return false;
    return (object.constructor !== Object);
}

function readFile() {
    let fs = new FileSystemInterface(app.getFileStructure());

    fs.readdir("./", (err, files) => {
        if(err) console.log(err);
        else {
            files.forEach(file => {
                if(!isFile(file)) return;
                fs.read("/" + file, (err, buffer) => {
                    let enc = new TextDecoder("utf-8");
                    if(err) console.log(err);
                    else console.log(enc.decode(buffer));
                });
            });
        }
    });
}