import { request } from '../../utils/request';
import { formatTime } from '../../utils/format';
import regeneratorRuntime from '../../utils/runtime';

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

  onLoad(options) {
    const { id } = options;

    this.getMusicInfo(id);
    this.getLyric(id);
    

    manager.onCanplay(() => {
      console.log('onCanplay')
      this.autoScroll();
    });

    // 自然结束播放
    manager.onEnded(() => {
      this.setPlayInfo();  //重新播放
      this.setData({
        nowTime: '00:00',
        nowValue: 0
      });
    });
  
  },

  // 歌词
  async getLyric(id) {
    const res = await request({url: '/lyric', data: { id }});
    const lyric =  res.lrc.lyric;
    const { lrcTime, lrcCont } = this.parseLyric(lyric);

    this.setData({ lrcTime, lrcCont });
  },
  // 歌曲详情
  async getMusicInfo(id) {
    const p1 =  request({url: '/music/url', data: { id }});
    const p2 =  request({url: '/music/detail', data: { id }});
    const res = await Promise.all([p1, p2]);

    const info = res[1].songs[0];
    const title = this.setTitle(info);

    this.setData({
      url: res[0].data[0].url,
      title,
      duration: info.dt,
      picUrl: info.al.picUrl,
      singer: info.ar.map(item => item.name).join('/'),
      totalTime: formatTime(info.dt)
    });
    this.setPlayInfo();
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
    const patt  = /\d{2}:\d{2}\.\d{2,3}/g;
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
