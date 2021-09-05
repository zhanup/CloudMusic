import { request } from '../../utils/request';
import regeneratorRuntime from '../../utils/runtime';

Page({

  data: {
    hots: [],
    history: [],
    mode: 1,
    inpValue: '',
    suggestList: [],
    matchlist: [],
    songlist:[],
    offset: 0,
    keywords: '',
    total: 0,
    flag: true
  },

  timer: -1,

  onLoad() {
    this.getHotWord();
  },
  // 触底加载更多
  onReachBottom() {
    const { offset, songlist, keywords, total } = this.data;
    if (songlist.length === total) {
      const { flag } = this.data;
      if (flag) {
        wx.showToast({
          title: '歌曲已全部加载',
          icon: 'none',
          duration: 2000
        });
      }
      this.setData({ flag: false });
      return;
    }
    this.setData({offset: offset + 1});
    this.getSong(keywords);
  },

  // 热门搜索关键字
  async getHotWord() {
    const res = await request({ url: '/search/hot' });
    this.setData({ hots: res.result.hots.map(item => item.first) });
  },
  // 搜索建议
  async getSuggest(value) {
    const res = await request({ url: '/search/suggest', data: { keywords: value } })
    this.setData({ suggestList: res.result.allMatch });
  },
  // 专辑列表
  async getMatch(value) {
    const res = await request({ url: '/search/multimatch', data: { keywords: value } });
    this.setData({matchlist: res.result});
  },
  // 歌曲列表
  async getSong(value) {
    const { offset, songlist } = this.data;
    const res = await request({ url: '/search', data: { offset: offset*10, keywords: value, limit: 10} });
    this.setData({
      songlist: [...songlist, ...res.result.songs],
      keywords: value,
      total: res.result.songCount
    });
  },

  handleEnter(e) {
    const { value } = e.detail;
    const { history } = this.data;

    // 判断是否已经存在历史
    if (history.indexOf(value) === -1) {
      history.unshift(value);
    }

    // 切换显示，保存到历史
    this.setData({
      mode: 3,
      history
    });

    this.getMatch(value);
    this.getSong(value);
  },

  handleInput(e) {   
    // 获取输入框的值
    const { value } = e.detail;

    // 检验合法性
    if (!value.trim()) {
      this.handleClear();
      return;
    }

      this.setData({
        mode: 2,
        inpValue: value
      });

      // 防抖
      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
         this.getSuggest(value);
      }, 500);
  },

  // 清除数据
  handleClear() {
    this.setData({
      mode: 1,
      inpValue: '',
      suggestList: [],
      matchlist: [],
      songlist: [],
      offset: 0,
      keywords: '',
      total: 0,
      flag: true
    })
  },

  // 热门搜索
  handleHotSearch(e) {  
    const { word } = e.currentTarget.dataset;
    const { history } = this.data;

    // 判断history数组是否已经有word
    if (history.indexOf(word) === -1) {
      history.unshift(word);
    }
    // 保存数据
    this.setData({
      mode: 3,
      history,
      inpValue: word
    });

    this.getMatch(word);
    this.getSong(word);
  },

  // 建议搜索
  handleSuggestSearch(e) {
    const { suggest } = e.currentTarget.dataset;
    const { history } = this.data;

    // 判断是否已经存在历史
    if (history.indexOf(suggest) === -1) {
      history.unshift(suggest);
    }

    // 保存数据
    this.setData({
      mode: 3,
      history
    });

    this.getMatch(suggest);
    this.getSong(suggest);
  },

  // 移除搜索历史
  handleRemoveHistory(e) {
    const { index } = e.currentTarget.dataset;
    const { history } = this.data;
    // 移除
    history.splice(index, 1);
    // 保存
    this.setData({
      history
    });
  }
})