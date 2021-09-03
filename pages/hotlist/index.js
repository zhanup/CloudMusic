import { request } from '../../utils/request';
import { formatNumber } from '../../utils/format';
import regeneratorRuntime from '../../utils/runtime';

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
  onPullDownRefresh() {
    this.setData({hotSongs: []});
    // 下拉重新获取歌曲列表
    this.getHotSongs(() => {
      setTimeout(() => {
        wx.stopPullDownRefresh();
      }, 500);
    });
  },
  async getHotSongs(callback) {
    const result = await request({url: '/top/songs'});
    const hotSongs = result.data;
    hotSongs.forEach((item) => {
      item.artists = item.artists.map(item => item.name).join(' / ');
    });
    this.setData({ hotSongs });
    callback && callback();
  }
});
