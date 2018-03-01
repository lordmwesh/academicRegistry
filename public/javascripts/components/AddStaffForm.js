const addStaffFormTemplate = `
<div class="panel">
    <div class="panel-heading">
        <h4>Add Staff</h4>
    </div>
    <div class="panel-body">
        <form class="form" name="addStaffForm" @submit="saveForm(addStaffForm, event)">
            <div class="form-group">
                <label class="control-label">Address</label>
                <input type="text" class="form-control" v-model="staff.member">
                <div class="help-block text-info">
                    <small>Staff member blockchain address</small>
                </div>
            </div>
            <div class="form-group">
                <label class="control-label">Name</label>
                <input type="text" class="form-control" v-model="staff.name">
            </div>
            <div class="row">
                <div class="col-6">
                    <label class="control-label">Initial Permission</label>
                    <select class="form-control" v-model="staff.permission">
                        <option value="">Select permission</option>
                        <option v-for="permission in permissions" :value="permission.id" :key="permission.id">{{permission.label}}</option>
                    </select>
                    <div class="help-block text-info">
                        <small>You can add more permissions later</small>
                    </div>
                </div>
                <div class="col-6">
                    <label class="control-label">Since</label>
                    <input type="date" class="form-control" v-model="staff.memberSince">
                </div>
            </div>
            <div class="row">
                <div class="col-12 my-2">
                    <button class="btn btn-success" type="submit">
                        <i class="fa fa-check"></i> Save
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>`;
Vue.component('add-staff-form', {
    template: addStaffFormTemplate,
    data () {
        return {
            staff: {
                member: null,
                name: null,
                memberSince: null,
                permission: ''
            },
            permissions: [
                { id:0, name: 'CanEnrollCandidate', label: 'Can Enroll Candidate'},
                { id:1, name: 'CanUpdateProgram', label: 'Can Update Program'},
                { id:2, name: 'CanUpdateUnits', label: 'Can Update Units'},
                { id:3, name: 'CanUpdateStaff', label: 'Can Update Staff'},
                { id:4, name: 'CanClearCandidate', label: 'Can Clear Candidate'},
                { id:5, name: 'CanRegisterCandidateUnits', label: 'Can Register Candidate Units'},
                { id:6, name: 'CanMarkUnits', label: 'Can Mark Units'},
                { id:7, name: 'CanUpdateFees', label: 'Can Update Fees'}
            ]
        }
    },
    created: function() {
        
    },
    methods: {
        saveForm: function(addStaffForm, event) {
            event.preventDefault();
            App.showProcessing();
            var payload = this.staff;
            payload.user = store.state.user;
            
            axios.post('api/add-staff', payload)
              .then(function (response) {
                console.log(response);
                App.hideProcessing();
                App.notify(response.data.detail, response.data.status);
              })
              .catch(function (error) {
                const err = error.response.data;
                App.hideProcessing();
                App.notify(err.detail, 'danger');
              });
        }
    }
});