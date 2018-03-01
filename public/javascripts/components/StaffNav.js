var StaffNav = new Vue({
    el: '#staffNav',
    data: {
      title: 'MANAGEMENT DASHBOARD',
      staffs: [],
      active_user: store.state.user || ''
    },
    watch: {
      active_user: function(newVal, oldVal) {
        if (newVal) {
          store.state.user = newVal;
          window.localStorage.setItem('store.state.user', newVal);
          App.notify(newVal +' account activated', 'success');
        }
      }
    },
    created() {
      this.getStaffs();
    },
    methods: {
      getStaffs: function() {
        var self = this;
        App.showProcessing({target: '#staffNav'});
        axios.get('api/get-staffs', {})
          .then(function (response) {
            console.log(response);
            self.staffs = response.data.detail;
            App.hideProcessing('#staffNav');
          })
          .catch(function (error) {
            const err = error.response.data;
            App.hideProcessing('#staffNav');
            App.notify(err.detail, 'danger');
          });
      }
    }
  })