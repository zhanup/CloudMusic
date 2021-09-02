import { formatPlayCount } from '../../utils/format';
import { request } from '../../utils/request';
import regeneratorRuntime from '../../utils/runtime';

Page({
  data: {
    remdSongs: [],
    remdNewsg: []
  },
  onLoad() {
    this.getRemdSongs();
    this.getRemdNewsg();
  },

  // 编辑推荐
  async getRemdSongs() {
    const res = await request({url: '/personalized'});
    const remdSongs = res.result;
    remdSongs.forEach(item => item.playCount = formatPlayCount(item.playCount));
    this.setData({
      remdSongs
    });
  },

  // 最新音乐
  async getRemdNewsg() {
    const res = await request({url: '/personalized/newsong'});
    this.setData({
      remdNewsg: res.result.map(item => item.song)
    })
  }
})