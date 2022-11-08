class AudioResource {
    key: string;
    volume: number;
    audio: HTMLAudioElement;

    constructor(key: string, volume: number, path: string) {
        this.key = key;
        this.volume = volume;
        this.audio = new Audio(path);
        this.audio.volume = this.volume;
    }

    Play(): void {
        this.audio.currentTime = 0;
        if (this.volume)
            this.audio.play();
    }
}

const AudioResources = [
    new AudioResource('hover0', 0.6, './sounds/cards-hover1.mp3'),
    new AudioResource('hover1', 0.6, './sounds/cards-hover2.mp3'),
    new AudioResource('hover2', 1, './sounds/cards-hover3.mp3'),
    new AudioResource('hover3', 1, './sounds/cards-hover4.mp3'),
    new AudioResource('shuffle', 1, './sounds/cards-shuffle.mp3'),
    new AudioResource('start', 0.6, './sounds/cards-start.mp3'),
    new AudioResource('appear', 0.6, './sounds/cards-appear.mp3'),
    new AudioResource('moving', 0.8, './sounds/cards-moving.mp3'),
    new AudioResource('sweep0', 0.35, './sounds/cards-sweep0.mp3'),
    new AudioResource('sweep1', 0.35, './sounds/cards-sweep1.mp3'),
    new AudioResource('trump', 0.5, './sounds/cards-trump.mp3'),
    new AudioResource('placed0', 0.2, './sounds/cards-placed0.mp3'),
    new AudioResource('placed1', 0.5, './sounds/cards-placed1.mp3'),
    new AudioResource('placed2', 0.5, './sounds/cards-placed2.mp3'),
    new AudioResource('placed3', 0.5, './sounds/cards-placed3.mp3'),
    new AudioResource('placed4', 0.5, './sounds/cards-placed4.mp3')
];

class AudioManager {
    Audios: Array<AudioResource> = [];
    SoundsToggle: boolean = false;

    constructor() {
        for (const Audio of AudioResources) {
            this.Audios.push(Audio);
        }
    }

    Play(key: string): void {
        if (this.SoundsToggle) {
            if (key === 'hover') {
                this.Audios.find(x => x.key === `hover${Math.floor(Math.random() * 3)}`)?.Play();
            }
            else if(key === 'sweep'){
                this.Audios.find(x => x.key === `sweep${Math.floor(Math.random() * 2)}`)?.Play();
            }
            else if(key === 'placed'){
                let index: number = Math.floor(Math.random() * 5);
                console.log(index!);
                
                this.Audios.find(x => x.key === `placed${index}`)?.Play();
            }
            else {
                this.Audios.find(x => x.key === key)?.Play();
            }
        }
    }

    Toggle(): boolean {
        return this.SoundsToggle = !this.SoundsToggle;
    }
}