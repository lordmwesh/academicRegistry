var CandidateSumary = new Vue({
    el: '#candidateSumary',
    data () {
        return {
            certificate: {
                id: null,
                document: 'N/A'
            }
        }
    },
    computed: {
        // candidate () {
        //     return store.state.candidate
        // }
    },
    watch: {
        // candidate: function (newValue, oldValue) {
        //     if (newValue) {
        //         this.getCertificate(admissionNumber = newValue.admissionNumber)
        //     }
        // }
    },
    filters: {
        toDate: function (timestamp) {
            try {
                return moment(timestamp, 'x').format('MMM Do, YYYY');
            } catch (ex) {
                console.log('Date error', ex);
            }
        }
    },
    methods: {
        getCertificate: function (admissionNumber) {
            var self = this;
            var payload = {
                admissionNumber: admissionNumber
            };
            var self = this;
            App.showProcessing();
            axios.post('api/get-candidate-certificate', payload)
              .then(function (response) {
                console.log(response);
                self.certificate = response.data.detail;
                App.hideProcessing();
              })
              .catch(function (error) {
                const err = error.response.data;
                App.notify(err.detail, 'danger');
                App.hideProcessing();
              });
        }
    }
})