import { formatNumber } from '../../utils/util';
import { request } from '../../request/index';
import regeneratorRuntime from '../../lib/runtime/runtime';

Page({
  data: {
    hotSongs:[],
    nowDate: ''
  },
  onLoad: function() {
    this.getHotSongs();
    const date = new Date();
    this.setData({
      nowDate: `${formatNumber(date.getMonth() + 1)}月${formatNumber(date.getDate())}日`
    });
  },
  async getHotSongs() {
    const res = await request({url: '/toplist/detail'});
    const hotSongs = res.result.tracks;
    hotSongs.forEach((item) => {
      item.artists = item.artists.map(item => item.name).join(' / ');
    });
    this.setData({ hotSongs });
  }
})