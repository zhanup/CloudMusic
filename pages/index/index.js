import { formatPlayCount } from '../../utils/util';
import { request } from '../../request/index';
import regeneratorRuntime from '../../lib/runtime/runtime';

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
    let remdNewsg = [];
    remdNewsg = res.result.map(item => item.song)
    this.setData({
      remdNewsg
    })
  }
})