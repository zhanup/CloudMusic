import { request } from '../../request/index';
import regeneratorRuntime from '../../lib/runtime/runtime';

Page({
  data: {
    playlist: []
  },
  onLoad(options) {
    const { id } = options;
    this.getPlaylist(id);
  },

  async getPlaylist(id) {
    const res = await request({ url: '/playlist/detail', data: { id } });
    this.setData({ playlist: res.playlist });
  }
})