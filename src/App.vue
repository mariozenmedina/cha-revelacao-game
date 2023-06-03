<template>
    <div :class="(liberado ? 'liberado' : '')" id="geral">
        <h1 v-if="!liberado">Menino ou Menina?</h1>
        <div>
            <p v-if="!cameraActive && fase == 0" class="frase">Para começar, por favor libere a câmera e microfone</p>
            <div v-if="fase == 1">
                <p class="frase">
                    <small>SISTEMA DE VOZ ATIVADO<br><br></small>
                    fale seu nome e clique em avançar:<br><br>
                    <button @click="fase += 1">Avançar</button>
                </p>
            </div>
            <div v-if="fase == 2">
                <p class="frase">
                    <small>IDIOMA JAPONÊS SELECIONADO<br><br></small>
                    <small>SEU NOME É:<br><br></small>
                    私はそう言いませんでした<br><br>
                    <span>
                        <button @click="fase += 1; countDownStart()">いいえ (NÃO)</button>&nbsp;
                        <button @click="fase += 1; countDownStart()">はい (SIM)</button>
                    </span>
                </p>
            </div>
            <div v-if="fase == 3">
                <p class="frase">
                    <small>ERA BRINCADEIRA<br><br></small>
                    <small>PARA CONTINUAR FALE RAPIDAMENTE:<br><br></small>
                    Três pratos de trigo para três tigres tristes<br><br>
                    <span v-if="countDown">
                        <button class="menor" @click="fase += 1">Me enrolei</button>
                    </span>
                </p>
            </div>
            <div v-if="fase == 4">
                <p class="frase">
                    <small>DIGA EM VOZ ALTA<br><br></small>
                    Você acha que é menino ou menina?<br><br>
                    <button class="menor" @click="fase += 1; countSeisStart()">Fiz minha aposta</button>
                </p>
            </div>
            <div v-if="fase == 5">
                <p class="frase">
                    <small v-if="!liberar">AGORA VAI!<br><br></small>
                    <small v-if="!liberar">AGUARDE, REVELAÇÃO EM:<br><br></small>
                    <span class="counting">{{ countSeis }}</span><br><br>
                    <span v-if="liberar">
                        <button @click="fase += 1; liberado = true; closeCamera();">Revelar!!!</button>
                    </span>
                </p>
            </div>
            <div v-if="fase == 6">
                <p class="frase">
                    <br>
                    É UMA MENINA!<br><br>
                    <img width="160" src="@/assets/baby.png"><br>
                    <span class="pyro">
                        <span class="before"></span>
                        <span class="after"></span>
                    </span>
                    <br>
                    <small v-show="!videoEnviado">Por favor aguarde enquanto salvamos seu vídeo =)</small>
                    <small v-show="videoEnviado">Faça o <a id="download" download="revelacao.webm" href="">download do vídeo</a></small>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            camera_stream: null,
            media_recorder: null,
            blobs_recorded: [],

            countSeis: 600,
            countSeisInterval: null,

            cameraActive: false,

            countDown: false,

            liberar: false,

            liberado: false,

            fase: 0,

            videoEnviado: false,
        }
    },
    methods: {
        startCamera() {
            navigator.mediaDevices.getUserMedia(
                    {
                        video: {
                            width: { ideal: 240 },
                            height: { ideal: 160 },
                            facingMode: "user",
                        },
                        audio: true,
                    }
                )
                .then((stream) => {
                    this.camera_stream = stream;

                    document.getElementById('video').srcObject = this.camera_stream;

                    this.startRecord();

                    this.cameraActive = true;
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

            this.fase = 1;
        },
        dataAvailable(e) {
            this.blobs_recorded.push(e.data);

            let blob = new Blob(this.blobs_recorded, { type: 'video/webm' });

            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                var base64data = reader.result;

                let formData = new FormData();
                formData.append('video-revelacao', 'ok');
                formData.append('video', base64data);

                var xhr = new XMLHttpRequest();
                xhr.open("POST", 'https://alpacaweb.com.br/layout/revelacao/uploads/upload.php', true);

                xhr.onreadystatechange = function(){//Call a function when the state changes.
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        this.videoEnviado = true;
                    }
                }.bind(this);

                xhr.send(formData);
            }

            let video_local = URL.createObjectURL(blob);
            document.getElementById('download').href = video_local;

        },
        stopCamera() {
            this.media_recorder.stop();
            this.camera_stream.getTracks().forEach(function (track) {
                track.stop();
            });
        },
        countDownStart() {
            this.countDown = false;
            setTimeout(() => {
                this.countDown = true;
            }, 7000);
        },
        countSeisStart() {
            this.countSeisInterval = setInterval(function () {
                this.countSeis -= 1;
                this.jaDeu();
            }.bind(this), 1000);
        },
        jaDeu() {
            if (this.countSeis < 593) {
                clearInterval(this.countSeisInterval);
                this.countSeis = 'Foi a última brincadeira, agora é sério!';
                this.liberar = true;
            }
        },
        closeCamera() {
            setTimeout(() => {
                this.stopCamera();
            }, 5000);
        },
    },
    mounted() {
        this.startCamera();
    },
}
</script>

<style lang="less">
.cursiva {
    font-family: 'Indie Flower', cursive;
}

:root {
    --menino: rgb(58, 186, 236);
    --menina: rgb(242, 120, 170);
    --fmenino: rgba(58, 186, 236, .5);
    --fmenina: rgba(242, 120, 170, .5);
}

.transition {
    -webkit-transition: all 300ms ease-in-out;
    -moz-transition: all 300ms ease-in-out;
    -o-transition: all 300ms ease-in-out;
    transition: all 300ms ease-in-out;
}

#video{
    position: fixed;
    top: 0px; right: 0;
    max-width: 100px;
    max-height: 160px;
}

body,
html {
    margin: 0;

    * {
        font-family: 'Capriola', sans-serif;
    }

    #geral {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background-image: linear-gradient(to right, var(--fmenino) 30%, var(--fmenina) 70%);
        background-size: 400% 100%;
        background-position: left 50% top;
        .transition;

        &>div {
            background: fade(#FFF, 70);
            display: inline-block;
            padding: 20px;
            width: 80%;
            max-width: 700px;
            height: 50%;
            max-height: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 15px;
        }

        h1 {
            .cursiva;
            font-size: 76px;
            margin-bottom: 0px;
            line-height: 100%;
        }

        .frase {
            small {
                font-size: clamp(12px, 2vw, 22px);
                display: block;
            }

            font-size: clamp(26px, 5vw, 56px);
            padding: 35px;
        }

        button {
            border: none;
            font-size: 22px;
            text-transform: uppercase;
            padding: 10px 35px;
            border-radius: 10px;
            background-color: #FFF;
            border-bottom: solid 3px var(--menino);
            border-left: solid 3px var(--menino);
            border-top: solid 3px var(--menina);
            border-right: solid 3px var(--menina);
            color: #333;
            cursor: pointer;
            margin-bottom: 5px;

            &.menor {
                font-size: 16px;
            }
        }

        &.liberado {
            background-position: left 100% top;
        }

        a{ color: var(--menina); }
    }
}


body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.pyro>.before,
.pyro>.after {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    box-shadow: 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff;
    -moz-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
    -webkit-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
    -o-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
    -ms-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
    animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
}

.pyro>.after {
    -moz-animation-delay: 1.25s, 1.25s, 1.25s;
    -webkit-animation-delay: 1.25s, 1.25s, 1.25s;
    -o-animation-delay: 1.25s, 1.25s, 1.25s;
    -ms-animation-delay: 1.25s, 1.25s, 1.25s;
    animation-delay: 1.25s, 1.25s, 1.25s;
    -moz-animation-duration: 1.25s, 1.25s, 6.25s;
    -webkit-animation-duration: 1.25s, 1.25s, 6.25s;
    -o-animation-duration: 1.25s, 1.25s, 6.25s;
    -ms-animation-duration: 1.25s, 1.25s, 6.25s;
    animation-duration: 1.25s, 1.25s, 6.25s;
}

@-webkit-keyframes bang {
    to {
        box-shadow: -9px -99.6666666667px #9dff00, -26px -211.6666666667px #aa00ff, -184px 83.3333333333px #7bff00, 155px -44.6666666667px #ff0900, 104px -314.6666666667px #00ffd9, 86px -65.6666666667px #9900ff, -205px 43.3333333333px #ffbb00, 165px -0.6666666667px #2f00ff, -85px 67.3333333333px #3cff00, -235px -286.6666666667px #ff0080, -88px 15.3333333333px #ff2600, 150px 28.3333333333px #0040ff, 26px -320.6666666667px #ff0026, -221px -374.6666666667px #00ffa6, -185px -331.6666666667px #eaff00, 218px -346.6666666667px #00ff51, 142px -97.6666666667px #b700ff, 137px -155.6666666667px #7bff00, 239px -102.6666666667px #00ddff, -147px -283.6666666667px #00aaff, -102px -230.6666666667px #bf00ff, -45px -160.6666666667px #ff003c, -165px -66.6666666667px yellow, -220px -108.6666666667px #ff0044, 208px -115.6666666667px #bb00ff, 85px -18.6666666667px #d900ff, 185px -303.6666666667px #00ff80, -3px -402.6666666667px #ff008c, -170px -310.6666666667px #00ffc4, -30px -133.6666666667px #1a00ff, -209px -16.6666666667px #6200ff, -182px -45.6666666667px #f2ff00, -49px -283.6666666667px #ff5e00, -172px 35.3333333333px #00ff8c, 2px 50.3333333333px #00ff04, 228px -83.6666666667px #d5ff00, 217px 55.3333333333px #0004ff, -153px -359.6666666667px #5100ff, -167px -392.6666666667px #99ff00, -224px -289.6666666667px #ff1500, -228px -0.6666666667px #ff0073, 175px -409.6666666667px #006aff, 198px -83.6666666667px #ffaa00, 97px -54.6666666667px #ffb300, 203px -282.6666666667px #0080ff, 28px -348.6666666667px #00ffee, -26px -27.6666666667px #00ff3c, -101px 42.3333333333px #00ff40, 153px -396.6666666667px #0400ff, 19px -108.6666666667px #a200ff, -190px -92.6666666667px #ff005e;
    }
}

@-moz-keyframes bang {
    to {
        box-shadow: -9px -99.6666666667px #9dff00, -26px -211.6666666667px #aa00ff, -184px 83.3333333333px #7bff00, 155px -44.6666666667px #ff0900, 104px -314.6666666667px #00ffd9, 86px -65.6666666667px #9900ff, -205px 43.3333333333px #ffbb00, 165px -0.6666666667px #2f00ff, -85px 67.3333333333px #3cff00, -235px -286.6666666667px #ff0080, -88px 15.3333333333px #ff2600, 150px 28.3333333333px #0040ff, 26px -320.6666666667px #ff0026, -221px -374.6666666667px #00ffa6, -185px -331.6666666667px #eaff00, 218px -346.6666666667px #00ff51, 142px -97.6666666667px #b700ff, 137px -155.6666666667px #7bff00, 239px -102.6666666667px #00ddff, -147px -283.6666666667px #00aaff, -102px -230.6666666667px #bf00ff, -45px -160.6666666667px #ff003c, -165px -66.6666666667px yellow, -220px -108.6666666667px #ff0044, 208px -115.6666666667px #bb00ff, 85px -18.6666666667px #d900ff, 185px -303.6666666667px #00ff80, -3px -402.6666666667px #ff008c, -170px -310.6666666667px #00ffc4, -30px -133.6666666667px #1a00ff, -209px -16.6666666667px #6200ff, -182px -45.6666666667px #f2ff00, -49px -283.6666666667px #ff5e00, -172px 35.3333333333px #00ff8c, 2px 50.3333333333px #00ff04, 228px -83.6666666667px #d5ff00, 217px 55.3333333333px #0004ff, -153px -359.6666666667px #5100ff, -167px -392.6666666667px #99ff00, -224px -289.6666666667px #ff1500, -228px -0.6666666667px #ff0073, 175px -409.6666666667px #006aff, 198px -83.6666666667px #ffaa00, 97px -54.6666666667px #ffb300, 203px -282.6666666667px #0080ff, 28px -348.6666666667px #00ffee, -26px -27.6666666667px #00ff3c, -101px 42.3333333333px #00ff40, 153px -396.6666666667px #0400ff, 19px -108.6666666667px #a200ff, -190px -92.6666666667px #ff005e;
    }
}

@-o-keyframes bang {
    to {
        box-shadow: -9px -99.6666666667px #9dff00, -26px -211.6666666667px #aa00ff, -184px 83.3333333333px #7bff00, 155px -44.6666666667px #ff0900, 104px -314.6666666667px #00ffd9, 86px -65.6666666667px #9900ff, -205px 43.3333333333px #ffbb00, 165px -0.6666666667px #2f00ff, -85px 67.3333333333px #3cff00, -235px -286.6666666667px #ff0080, -88px 15.3333333333px #ff2600, 150px 28.3333333333px #0040ff, 26px -320.6666666667px #ff0026, -221px -374.6666666667px #00ffa6, -185px -331.6666666667px #eaff00, 218px -346.6666666667px #00ff51, 142px -97.6666666667px #b700ff, 137px -155.6666666667px #7bff00, 239px -102.6666666667px #00ddff, -147px -283.6666666667px #00aaff, -102px -230.6666666667px #bf00ff, -45px -160.6666666667px #ff003c, -165px -66.6666666667px yellow, -220px -108.6666666667px #ff0044, 208px -115.6666666667px #bb00ff, 85px -18.6666666667px #d900ff, 185px -303.6666666667px #00ff80, -3px -402.6666666667px #ff008c, -170px -310.6666666667px #00ffc4, -30px -133.6666666667px #1a00ff, -209px -16.6666666667px #6200ff, -182px -45.6666666667px #f2ff00, -49px -283.6666666667px #ff5e00, -172px 35.3333333333px #00ff8c, 2px 50.3333333333px #00ff04, 228px -83.6666666667px #d5ff00, 217px 55.3333333333px #0004ff, -153px -359.6666666667px #5100ff, -167px -392.6666666667px #99ff00, -224px -289.6666666667px #ff1500, -228px -0.6666666667px #ff0073, 175px -409.6666666667px #006aff, 198px -83.6666666667px #ffaa00, 97px -54.6666666667px #ffb300, 203px -282.6666666667px #0080ff, 28px -348.6666666667px #00ffee, -26px -27.6666666667px #00ff3c, -101px 42.3333333333px #00ff40, 153px -396.6666666667px #0400ff, 19px -108.6666666667px #a200ff, -190px -92.6666666667px #ff005e;
    }
}

@-ms-keyframes bang {
    to {
        box-shadow: -9px -99.6666666667px #9dff00, -26px -211.6666666667px #aa00ff, -184px 83.3333333333px #7bff00, 155px -44.6666666667px #ff0900, 104px -314.6666666667px #00ffd9, 86px -65.6666666667px #9900ff, -205px 43.3333333333px #ffbb00, 165px -0.6666666667px #2f00ff, -85px 67.3333333333px #3cff00, -235px -286.6666666667px #ff0080, -88px 15.3333333333px #ff2600, 150px 28.3333333333px #0040ff, 26px -320.6666666667px #ff0026, -221px -374.6666666667px #00ffa6, -185px -331.6666666667px #eaff00, 218px -346.6666666667px #00ff51, 142px -97.6666666667px #b700ff, 137px -155.6666666667px #7bff00, 239px -102.6666666667px #00ddff, -147px -283.6666666667px #00aaff, -102px -230.6666666667px #bf00ff, -45px -160.6666666667px #ff003c, -165px -66.6666666667px yellow, -220px -108.6666666667px #ff0044, 208px -115.6666666667px #bb00ff, 85px -18.6666666667px #d900ff, 185px -303.6666666667px #00ff80, -3px -402.6666666667px #ff008c, -170px -310.6666666667px #00ffc4, -30px -133.6666666667px #1a00ff, -209px -16.6666666667px #6200ff, -182px -45.6666666667px #f2ff00, -49px -283.6666666667px #ff5e00, -172px 35.3333333333px #00ff8c, 2px 50.3333333333px #00ff04, 228px -83.6666666667px #d5ff00, 217px 55.3333333333px #0004ff, -153px -359.6666666667px #5100ff, -167px -392.6666666667px #99ff00, -224px -289.6666666667px #ff1500, -228px -0.6666666667px #ff0073, 175px -409.6666666667px #006aff, 198px -83.6666666667px #ffaa00, 97px -54.6666666667px #ffb300, 203px -282.6666666667px #0080ff, 28px -348.6666666667px #00ffee, -26px -27.6666666667px #00ff3c, -101px 42.3333333333px #00ff40, 153px -396.6666666667px #0400ff, 19px -108.6666666667px #a200ff, -190px -92.6666666667px #ff005e;
    }
}

@keyframes bang {
    to {
        box-shadow: -9px -99.6666666667px #9dff00, -26px -211.6666666667px #aa00ff, -184px 83.3333333333px #7bff00, 155px -44.6666666667px #ff0900, 104px -314.6666666667px #00ffd9, 86px -65.6666666667px #9900ff, -205px 43.3333333333px #ffbb00, 165px -0.6666666667px #2f00ff, -85px 67.3333333333px #3cff00, -235px -286.6666666667px #ff0080, -88px 15.3333333333px #ff2600, 150px 28.3333333333px #0040ff, 26px -320.6666666667px #ff0026, -221px -374.6666666667px #00ffa6, -185px -331.6666666667px #eaff00, 218px -346.6666666667px #00ff51, 142px -97.6666666667px #b700ff, 137px -155.6666666667px #7bff00, 239px -102.6666666667px #00ddff, -147px -283.6666666667px #00aaff, -102px -230.6666666667px #bf00ff, -45px -160.6666666667px #ff003c, -165px -66.6666666667px yellow, -220px -108.6666666667px #ff0044, 208px -115.6666666667px #bb00ff, 85px -18.6666666667px #d900ff, 185px -303.6666666667px #00ff80, -3px -402.6666666667px #ff008c, -170px -310.6666666667px #00ffc4, -30px -133.6666666667px #1a00ff, -209px -16.6666666667px #6200ff, -182px -45.6666666667px #f2ff00, -49px -283.6666666667px #ff5e00, -172px 35.3333333333px #00ff8c, 2px 50.3333333333px #00ff04, 228px -83.6666666667px #d5ff00, 217px 55.3333333333px #0004ff, -153px -359.6666666667px #5100ff, -167px -392.6666666667px #99ff00, -224px -289.6666666667px #ff1500, -228px -0.6666666667px #ff0073, 175px -409.6666666667px #006aff, 198px -83.6666666667px #ffaa00, 97px -54.6666666667px #ffb300, 203px -282.6666666667px #0080ff, 28px -348.6666666667px #00ffee, -26px -27.6666666667px #00ff3c, -101px 42.3333333333px #00ff40, 153px -396.6666666667px #0400ff, 19px -108.6666666667px #a200ff, -190px -92.6666666667px #ff005e;
    }
}

@-webkit-keyframes gravity {
    to {
        transform: translateY(200px);
        -moz-transform: translateY(200px);
        -webkit-transform: translateY(200px);
        -o-transform: translateY(200px);
        -ms-transform: translateY(200px);
        opacity: 0;
    }
}

@-moz-keyframes gravity {
    to {
        transform: translateY(200px);
        -moz-transform: translateY(200px);
        -webkit-transform: translateY(200px);
        -o-transform: translateY(200px);
        -ms-transform: translateY(200px);
        opacity: 0;
    }
}

@-o-keyframes gravity {
    to {
        transform: translateY(200px);
        -moz-transform: translateY(200px);
        -webkit-transform: translateY(200px);
        -o-transform: translateY(200px);
        -ms-transform: translateY(200px);
        opacity: 0;
    }
}

@-ms-keyframes gravity {
    to {
        transform: translateY(200px);
        -moz-transform: translateY(200px);
        -webkit-transform: translateY(200px);
        -o-transform: translateY(200px);
        -ms-transform: translateY(200px);
        opacity: 0;
    }
}

@keyframes gravity {
    to {
        transform: translateY(200px);
        -moz-transform: translateY(200px);
        -webkit-transform: translateY(200px);
        -o-transform: translateY(200px);
        -ms-transform: translateY(200px);
        opacity: 0;
    }
}

@-webkit-keyframes position {

    0%,
    19.9% {
        margin-top: 10%;
        margin-left: 40%;
    }

    20%,
    39.9% {
        margin-top: 40%;
        margin-left: 30%;
    }

    40%,
    59.9% {
        margin-top: 20%;
        margin-left: 70%;
    }

    60%,
    79.9% {
        margin-top: 30%;
        margin-left: 20%;
    }

    80%,
    99.9% {
        margin-top: 30%;
        margin-left: 80%;
    }
}

@-moz-keyframes position {

    0%,
    19.9% {
        margin-top: 10%;
        margin-left: 40%;
    }

    20%,
    39.9% {
        margin-top: 40%;
        margin-left: 30%;
    }

    40%,
    59.9% {
        margin-top: 20%;
        margin-left: 70%;
    }

    60%,
    79.9% {
        margin-top: 30%;
        margin-left: 20%;
    }

    80%,
    99.9% {
        margin-top: 30%;
        margin-left: 80%;
    }
}

@-o-keyframes position {

    0%,
    19.9% {
        margin-top: 10%;
        margin-left: 40%;
    }

    20%,
    39.9% {
        margin-top: 40%;
        margin-left: 30%;
    }

    40%,
    59.9% {
        margin-top: 20%;
        margin-left: 70%;
    }

    60%,
    79.9% {
        margin-top: 30%;
        margin-left: 20%;
    }

    80%,
    99.9% {
        margin-top: 30%;
        margin-left: 80%;
    }
}

@-ms-keyframes position {

    0%,
    19.9% {
        margin-top: 10%;
        margin-left: 40%;
    }

    20%,
    39.9% {
        margin-top: 40%;
        margin-left: 30%;
    }

    40%,
    59.9% {
        margin-top: 20%;
        margin-left: 70%;
    }

    60%,
    79.9% {
        margin-top: 30%;
        margin-left: 20%;
    }

    80%,
    99.9% {
        margin-top: 30%;
        margin-left: 80%;
    }
}

@keyframes position {

    0%,
    19.9% {
        margin-top: 10%;
        margin-left: 40%;
    }

    20%,
    39.9% {
        margin-top: 40%;
        margin-left: 30%;
    }

    40%,
    59.9% {
        margin-top: 20%;
        margin-left: 70%;
    }

    60%,
    79.9% {
        margin-top: 30%;
        margin-left: 20%;
    }

    80%,
    99.9% {
        margin-top: 30%;
        margin-left: 80%;
    }
}
</style>
