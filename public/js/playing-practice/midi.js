// MIDI Module
import { Constants } from '../shared/constants.js';

export class MidiController {
    constructor() {
        this.midiAccess = null;
        this.midiInput = null;
        this.onMidiMessage = null;
    }

    midiToNoteName(midiNote) {
        const noteIndex = midiNote % 12;
        return Constants.NOTE_NAMES[noteIndex];
    }

    async init() {
        console.log('Initializing MIDI...');
        try {
            this.midiAccess = await navigator.requestMIDIAccess();
            console.log('MIDI Access granted!', this.midiAccess);
            
            console.log('Available MIDI inputs:');
            for (const input of this.midiAccess.inputs.values()) {
                console.log(`  - ${input.name} (ID: ${input.id})`);
            }
            
            this.midiAccess.onstatechange = (e) => {
                console.log('MIDI state change:', e);
                this.updateDevices();
            };
            
            // Load last used MIDI device
            const lastDevice = localStorage.getItem('lastMidiDevice');
            if (lastDevice) {
                console.log('Attempting to reconnect to last device:', lastDevice);
                this.selectInput(lastDevice);
            }
            
            return true;
        } catch (error) {
            console.error('MIDI Access Failed:', error);
            return false;
        }
    }

    updateDevices() {
        // This method would typically update UI elements
        // In the modular version, this should be handled by the UI controller
        if (this.onDeviceUpdate) {
            this.onDeviceUpdate(this.getAvailableDevices());
        }
    }

    getAvailableDevices() {
        if (!this.midiAccess) return [];
        
        const devices = [];
        for (const input of this.midiAccess.inputs.values()) {
            devices.push({ id: input.id, name: input.name });
        }
        return devices;
    }

    selectInput(inputId) {
        console.log('Selecting MIDI input:', inputId);
        
        if (this.midiInput) {
            console.log('Removing previous MIDI input listener');
            this.midiInput.onmidimessage = null;
        }
        
        if (inputId && this.midiAccess) {
            this.midiInput = this.midiAccess.inputs.get(inputId);
            if (this.midiInput) {
                console.log('MIDI Input selected successfully:', this.midiInput.name);
                this.midiInput.onmidimessage = (message) => this.handleMidiMessage(message);
                localStorage.setItem('lastMidiDevice', inputId);
                console.log('MIDI listener attached. Ready to receive messages.');
                return true;
            } else {
                console.error('Could not find MIDI input with ID:', inputId);
                return false;
            }
        } else {
            console.log('No input ID provided or MIDI access not available');
            return false;
        }
    }

    handleMidiMessage(message) {
        console.log('MIDI Message received:', message.data);
        const [status, note, velocity] = message.data;
        const command = status >> 4;
        const channel = status & 0xf;
        
        console.log(`  Command: ${command}, Channel: ${channel}, Note: ${note}, Velocity: ${velocity}`);
        
        if (command === 9 && velocity > 0) { // Note On
            const noteName = this.midiToNoteName(note);
            console.log(`MIDI Note ON: ${noteName} (MIDI note: ${note}, velocity: ${velocity})`);
            
            if (this.onMidiMessage) {
                this.onMidiMessage('noteOn', noteName, note, velocity);
            }
        } else if (command === 8 || (command === 9 && velocity === 0)) { // Note Off
            const noteName = this.midiToNoteName(note);
            console.log(`MIDI Note OFF: ${noteName} (MIDI note: ${note})`);
            
            if (this.onMidiMessage) {
                this.onMidiMessage('noteOff', noteName, note, velocity);
            }
        } else {
            console.log('Other MIDI message type:', command);
        }
    }

    isConnected() {
        return this.midiInput !== null;
    }

    // Diagnostic function
    forceAttach(deviceId) {
        console.log('=== FORCING MIDI ATTACHMENT ===');
        
        if (!deviceId) {
            console.log('ERROR: No device ID provided');
            return;
        }
        
        if (!this.midiAccess) {
            console.log('ERROR: No MIDI access available');
            return;
        }
        
        const input = this.midiAccess.inputs.get(deviceId);
        if (!input) {
            console.log('ERROR: Cannot find device with ID:', deviceId);
            return;
        }
        
        console.log('Found device:', input.name);
        input.onmidimessage = function(event) {
            console.log('*** MIDI RECEIVED ***', Array.from(event.data));
        };
        console.log('Listening for MIDI messages... Play some notes!');
    }
}