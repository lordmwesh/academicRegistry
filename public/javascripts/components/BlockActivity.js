var BlockActivity = new Vue({
    el: '#blockActivity',
    data: {
      events: [],
      transactions: [],
      active_transaction: null,
      showTransactionModal: false
    },
    created() {
      this.getEvents();
      this.getTransactions();
    },
    filters: {
      toASCII: function hex2a(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
      }
    },
    methods: {
      getEvents: function() {
        var self = this;
        axios.get('api/events')
          .then(function (response) {
            console.log('Events', response);
            self.events = response.data.detail;
          })
          .catch(function (error) {
            const err = error.response.data;
            App.notify(err.detail, 'danger');
          });
      },
      getTransactions: function() {
        var self = this;
        App.showProcessing({target: '#blockTransactions'})
        axios.get('api/logs')
          .then(function (response) {
            console.log('Transaction logs', response);
            self.transactions = response.data.detail;
            App.hideProcessing('#blockTransactions');
          })
          .catch(function (error) {
            const err = error.response.data;
            App.notify(err.detail, 'danger');
            App.hideProcessing('#blockTransactions');
          });
      },
      viewTransaction: function(transaction) {
        this.active_transaction = transaction;
        this.showTransactionModal = true;
      }
    }
});