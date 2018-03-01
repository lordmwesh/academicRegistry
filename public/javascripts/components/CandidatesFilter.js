var CandidatesFilter = new Vue({
  el: '#candidatesFilter',
  data: {
    query: '',
    candidates: []
  },
  created() {
    this.getCandidates();
  },
  methods: {
    doSearch() {
      var payload = {admissionNumber:this.query};
      var self = this;
        App.showProcessing({target: '#candidatesFilter'});
        axios.post('api/get-candidate', payload)
          .then(function (response) {
            console.log(response);
            self.candidates = response.data.detail;
            App.hideProcessing('#candidatesFilter');
          })
          .catch(function (error) {
            const err = error.response.data;
            App.hideProcessing('#candidatesFilter');
            App.notify(err.detail, 'danger');
          });
    },
    getCandidates() {
      var self = this;
        App.showProcessing({target: '#candidatesFilter'});
        axios.get('api/get-candidates', {})
          .then(function (response) {
            console.log(response);
            self.candidates = response.data.detail;
            App.hideProcessing('#candidatesFilter');
          })
          .catch(function (error) {
            const err = error.response.data;
            App.hideProcessing('#candidatesFilter');
            App.notify(err.detail, 'danger');
          });
    },
    viewCandidate(candidate) {
      store.state.candidate = candidate;
      store.state.view_mode = 'CANDIDATE-SUMMARY';
      console.log('Candidate', candidate);
    }
  }
})