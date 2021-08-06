void async function () {
    'use strict'

    function loadScript(url = 'https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js') {
        return new Promise(resolve => {
            const script = document.getElementById('peer-js');
            script.src = url;
            script.onload = (script) => resolve(script);
        })
    }

    await loadScript();

    const socket = io('/');
    const videoGrid = document.getElementById('video-grid');


    const myPeer = new Peer(undefined, {
        host: '/',
        port: '3001'
    });

    socket.on('user-disconnect', userId => {
        console.log(userId)
    })

    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id);
    });

    const myVideo = document.createElement('video');
    myVideo.muted = true;

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream);

        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVStream => {
                addVideoStream(video, userVStream);
            })
        })


        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream);
        });
    });

    socket.on('user-connected', userId => {
        console.log(`User connected: ${userId}`)
    });

    function connectToNewUser(userId, stream) {
        const call = myPeer.call(userId, stream);
        const video = document.createElement('video');

        call.on('stream', userVStream => {
            addVideoStream(video, userVStream)
        });

        call.on('close', () => {
            video.remove();
        })
    }

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play()
        });

        videoGrid.append(video);
    }

}()