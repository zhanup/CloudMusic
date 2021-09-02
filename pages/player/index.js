import { request } from '../../utils/request';
import { formatTime } from '../../utils/format';
const manager = wx.getBackgroundAudioManager();

Page({
  data: {
    url: '',
    title: '',
    singer: '',
    picUrl: '',
    duration: 0,
    play: true,
    nowValue: 0,
    nowTime: '00:00',
    totalTime: '00:00',
    lrcTime: [],
    lrcCont: [],
    idx: 0
  },
  autoStop: false,

  async onLoad(options) {
    const { id } = options;
    
    const p1 = request({ url: '/music/url', data: { id } });  // 获取播放地址
    const p2 = request({ url: '/lyric', data: { id } });  // 获取歌词
    const p3 = request({ url: '/music/detail', data: { id } });  // 获取歌曲信息

    const result = await Promise.all([p1, p2, p3]);
    console.log(result);

    const url = result[0].data[0].url;
    const lyric = result[1].lrc.lyric;
    const detail = result[2].songs[0];
    const title = this.setTitle(detail);
    const { lrcTime, lrcCont } = this.parseLyric(lyric);

    this.setData({
      title,
      url,
      lrcTime,
      lrcCont,
      duration: detail.dt,
      picUrl: detail.al.picUrl,
      singer: detail.ar.map(item => item.name).join('/'),
      totalTime: formatTime(detail.dt)
    });

    this.setPlayInfo();
    this.autoScroll();

    // 自然结束播放
    manager.onEnded(() => {
      this.setPlayInfo();  //重新播放
      this.setData({
        nowTime: '00:00',
        nowValue: 0
      });
    });
    
  },

  // 设置歌曲名
  setTitle(data) {
    let title = '';
    if (data.alia[0]) {
      title = `${data.name}（${data.alia[0]}）`;
    } else {
      title = data.name;
    }
    return title;
  },

  // 格式化歌词
  parseLyric(lyric) {
    const patt  = /\d{2}:\d{2}\.\d{3}/g;
    let lrcTime = lyric.match(patt);  // 提取时间
    let lrcCont = lyric.trim().split('\n');  // 提取歌词
  
    lrcCont.forEach((v,i,a) =>  a[i] = v.slice(11));  // 去除空格
    lrcCont.forEach((v,i) => {
      if (v === '') {
        lrcTime.splice(i, 1);
        lrcCont.splice(i, 1)
      }
    });
    // 格式化时间
    lrcTime.forEach((v, i, a) =>{
      const t = v.split(':')
      a[i] = parseInt(t[0], 10) * 60 * 1000 + parseFloat(t[1]) * 1000;
    });

    return {lrcTime, lrcCont};
  },

  // 设置要播放音乐的信息
  setPlayInfo() {
    const { title, singer, picUrl, url } = this.data;
      manager.title = title;
      manager.singer = singer;
      manager.coverImgUrl = picUrl;
      manager.src = url;
      manager.startTime = 0;
  },

  // 自动滚动歌词和进度条
  autoScroll() {
    const { lrcTime } = this.data;

    manager.onTimeUpdate(() => {
      if (this.autoStop === false) {
        const curTime = Math.round(manager.currentTime * 1000);

        for (let i = 0; i < lrcTime.length; i++) {
          if (lrcTime[i] >= curTime) {
            this.setData({ idx: i });
            break;
          }
        }

        this.setData({
          nowTime: formatTime(curTime),
          nowValue: curTime 
        });
      }
    })
  },

  // 控制播放
  playMusic() {
    console.log(111)
    let { play } = this.data;
    if (play) {
      play = false;
      manager.pause();
    } else {
      play = true;
      manager.play();
    }
    this.setData({ play });
  },

  // 拖到进度条，自动滚动停止
  handleChanging() {
    if (this.autoStop === false) {
      this.autoStop = true;
    }
  },

  handleChange(e) {
    this.autoStop = true;
    // 获取拖动后的时间
    const { value } = e.detail;
    let time = +(value / 1000).toFixed(3);

    this.setData({ 
      nowTime: formatTime(value),
      nowValue: value
    });

    // 播放时间跳转
    manager.seek(time);

    this.autoStop = false;
  }
})
