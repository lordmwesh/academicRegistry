Vue.use(Vuex);
const store = new Vuex.Store({
    state: {
      candidate: null,
      view_mode: 'MANAGE',
      user: window.localStorage.getItem('store.state.user') ? window.localStorage.getItem('store.state.user'): null
    },
    mutations: {}
});


// const moduleA = {
//     state: { ... },
//     mutations: { ... },
//     actions: { ... },
//     getters: { ... }
//   }
  
//   const moduleB = {
//     state: { ... },
//     mutations: { ... },
//     actions: { ... }
//   }
  
//   const store = new Vuex.Store({
//     modules: {
//       a: moduleA,
//       b: moduleB
//     }
//   })
  
//   store.state.a // -> `moduleA`'s state
//   store.state.b // -> `moduleB`'s state