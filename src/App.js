import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';
import Permissions from 'react-native-permissions';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';

let sound = null;

const App = () => {
    const [audioFile, setAudioFile] = useState('');
    const [recording, setRecording] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [paused, setPaused] = useState(false);

    const checkPermission = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: "App Microphone Permission",
                message: "This App needs access to your microphone so you can record audio.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );

        const p = await Permissions.check('microphone');
        console.log('permission check', p);
        if (p === 'authorized') return;
        return requestPermission();
    }

    const requestPermission = async () => {
        const p = await Permissions.request('microphone');
        console.log('permission request', p)
    }

    const start = () => {
        console.log('start recording...');
        setAudioFile('');
        setRecording(true);
        setLoaded(false);
        AudioRecord.start();
    }

    const stop = async () => {
        if (!recording) return;
        console.log('stop recording...');
        let audioFile = await AudioRecord.stop();
        console.log('audio file ==> ', audioFile);
        setAudioFile(audioFile);
        setRecording(false);
        setPaused(true)
    }

    const load = () => {
        return new Promise((resolve, reject) => {
            if (!audioFile) {
                return reject('file path is empty');
            }

            sound = new Sound(audioFile, '', error => {
                if (error) {
                    console.log('Failed to load the file', error);
                    return reject(error);
                }
                setLoaded(true);
                return resolve();
            });
        });
    };

    const play = async () => {
        if (!loaded) {
            try {
                await load();
            } catch (error) {
                console.log(error);
            }
        }

        setPaused(false);
        Sound.setCategory('Playback');

        sound.play(success => {
            if (success) {
                console.log('Successfully finished playing...');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
            setPaused(true)
        });
    };

    const pause = () => {
        sound.pause();
        setPaused(true);
    }

    useEffect(() => {

        checkPermission();

        const options = {
            sampleRate: 16000,
            channels: 1,
            bitsPerSample: 16,
            wavFile: 'test.wav'
        };

        AudioRecord.init(options);

        AudioRecord.on('data', data => {
            const chunk = Buffer.from(data, 'base64');
            console.log('chunk size', chunk.byteLength);
        })
     
    }, [])
    

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.subContainer}>

        <View style={{alignItems: 'center', justifyContent: 'center', marginBottom: 20}}>
            <Text style={{fontSize: 22, color: '#000000'}}>Audio Recorder and Player</Text>
        </View>

        <View style={{ alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity onPress={start} style={styles.btnView}>
                <Text style={styles.btnText}>Record</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={stop} style={styles.btnView}>
                <Text style={styles.btnText}>Stop</Text>
            </TouchableOpacity>

            {
                paused ? (
<TouchableOpacity onPress={play} style={styles.btnView}>
                <Text style={styles.btnText}>Play</Text>
            </TouchableOpacity>
                ) : (
<TouchableOpacity onPress={pause} style={styles.btnView}>
                <Text style={styles.btnText}>Pause</Text>
            </TouchableOpacity>
                )
            }
            


            
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnView: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1b34f2',
        width: 100,
        height: 50,
        borderRadius: 10,
        margin: 5
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 18
    }
})

export default App;