<template>
    <div class="hello">
        <button @click="startCamera" id="start-camera">Start Camera</button>
        <video id="video" width="320" height="240" autoplay></video>
        <button @click="startRecord" id="start-record">Start Recording</button>
        <button @click="stopCamera" id="stop-record">Stop Recording</button>
        <a id="download-video" download="test.webm">Download Video</a>
    </div>
</template>

<script>
export default {
    name: 'HelloWorld',
    props: {
        msg: String
    },
    data() {
        return {
            camera_stream: null,
            media_recorder: null,
            blobs_recorded: [],
        }
    },
    methods: {
        startCamera() {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    this.camera_stream = stream;
                    let video = document.querySelector("#video");
                    video.srcObject = this.camera_stream;

                    this.startRecord();
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        startRecord() {
            // set MIME type of recording as video/mp4
            this.media_recorder = new MediaRecorder(this.camera_stream);

            // event : new recorded video blob available
            this.media_recorder.addEventListener('dataavailable', this.dataAvailable);

            this.media_recorder.start();
        },
        dataAvailable(e) {
            this.blobs_recorded.push(e.data);

            let blob = new Blob(this.blobs_recorded, { type: 'video/mp4' });
            let video_local = URL.createObjectURL(blob);
            let download_link = document.querySelector("#download-video");
            download_link.href = video_local;
        },
        stopCamera() {
            this.media_recorder.stop();
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}
</style>
