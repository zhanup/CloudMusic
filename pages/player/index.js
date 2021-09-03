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
    play: false,
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
    this.monitor();
  
  },

  // 监听歌曲播放
  monitor() {
    // 监听音乐开始播放
    manager.onPlay(() => {
      this.autoStop = true;
      this.setData({play: true});
      // console.log('-----onPlay-----')
    });

    // 音频加载中事件
    manager.onWaiting(() => {
      wx.showLoading({
        title: '加载中',
      });
      // console.log('-----onWaiting-----')
    });

    // 音频进入可播放状态事件
    manager.onCanplay(() => {
      wx.hideLoading()
      // console.log('-----onCanplay-----')
    });

    // 跳转完成
    manager.onSeeked(() => {
      this.autoStop = true;
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
    this.autoScroll();
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
    // 提取时间
    let lrcTime = lyric.match(patt);
    // 提取歌词
    let lrcCont = lyric.trim().split('\n');  

    // 去除空格
    lrcCont.forEach((v,i,a) =>  {
      const index = v.indexOf(']')
      a[i] = v.slice(index + 1);
    });
    // 去除空行
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
      if (this.autoStop === true) {
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
    this.autoStop = false;
  },

  // 拖动时的处理函数
  handleChange(e) {
    this.autoStop = false;
    // 获取拖动后的时间
    const { value } = e.detail;
    const time = +(value / 1000).toFixed(3);

     // 播放时间跳转
     manager.seek(time);

    this.setData({ 
      nowTime: formatTime(value),
      nowValue: value
    });

    // this.autoStop = true;
  }
})
