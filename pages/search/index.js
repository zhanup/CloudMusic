import { request } from '../../request/index';
// import regeneratorRuntime from '../../lib/runtime/runtime';

Page({

  data: {
    hots: [],
    history: [],
    mode: 1,
    inpValue: '',
    suggestList: [],
    matchlist: [],
    songlist:[]
  },

  timer: -1,

  onLoad() {
    this.getHotWord();
  },

  // 热门搜索关键字
  getHotWord() {
    request({ url: '/search/hot' }).then((res) => {
      this.setData({ hots: res.result.hots.map(item => item.first) });
    });
  },

  // 搜索结果
  getSearchData(value) {
    const p1 = request({ url: '/search/multimatch', data: { keywords: value } });
    const p2 = request({ url: '/search', data: { keywords: value } });

    Promise.all([p1, p2]).then(res => {
      // console.log(res)
      this.setData({
        matchlist: res[0].result,
        songlist: res[1].result.songs
      });
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

    this.getSearchData(value);
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
         // 发送请求
        request({ url: '/search/suggest', data: { keywords: value } }).then(res => {
          // 保存数据
          this.setData({ suggestList: res.result.allMatch });
        });
      }, 500)
  },

  // 清除数据
  handleClear() {
    this.setData({
      mode: 1,
      inpValue: '',
      suggestList: [],
      matchlist: [],
      songlist: []
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

    this.getSearchData(word);
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
    this.getSearchData(suggest);
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