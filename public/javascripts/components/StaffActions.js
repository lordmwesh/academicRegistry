var StaffActions = new Vue({
    el: '#staffActions',
    data: {
      actions: [
        {value: 'CANDIDATES', name: 'Candidates'},
        {value: 'PROGRAMS', name: 'Programs'},
        {value: 'STAFFS', name: 'Staffs'},
        {value: 'FEES', name: 'Update Fees'},
        {value: 'ADMIN-CLEARANCE', name: 'Admin Clearance'}
      ],
      action: {},
    },
    created() {
      
    },
    methods: {
      selectAction: function(action) {
        this.action = action;
      },
      setViewMode: function(view_mode) {
        store.state.view_mode = view_mode;
      }
    }
  })