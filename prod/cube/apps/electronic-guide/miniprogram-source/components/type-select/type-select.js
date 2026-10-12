import { getPointType } from '../api/index';
import { serviceUrl } from '../service/request';
Component({
  'properties': {},
  'data': {
    'typeList': []
  },
  'methods': {
    async 'getTypeList'() {
      const data = await getPointType();
      const firstType = {
        'name': '全部',
        'filePath': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAuZJREFUaEPtWl1IFFEU/s7sj4a76JKBL2laBGoIPlQW1ENkJPQDGRVSJBWFlLWJQpAS0QbBLmpZSGARFFKRPVRgpPhQEFoPgrVJUbutPSRkrrJruT+zN2ZsScTdmYnc3aGZt+F+d873nTnnnvtHmPN4mK84EgkfAdgWBuSCwTQXk9B3gp+AEYCecZy+I4/Mztn2KfrCGDO6IxPNBNQwxriEkpRpjIgiDGjP57LqiCgodBMFCOQ/8xPdDGyTzG8lFUagvmW6rApBhCjAxXuvgrHjSWWl1DjRtQKd5QT9jvmhVA2bWLqEcOI4fQm5eW8LY8yq1AGpgCeiVnLz407GUJQKhJRyIMI7cvHjvqQPlUqZR/HCEOsKj7O/7Z8K/f4fAWP+SZy914YXw4OYDgUWxPnphjRsKCzFxb21yDZlyrIh+w8cu2FDz1A/jHojipcuh0Gnk2VALijE83B++YRgOIjykjJcP9woq6tsAUX1lYgwhkcNLViZkyfr40pB7796sNNxGpwwvDi6ZHWXLaDg1DaU5heiy2rHd/8k7vf3IBASpyPzPrnZOdi1emZm8vB1H0bGRmNi0wxG7Ckrx2JTJipbGzDoHobr8pN/L2DNilW4W3sJ7b0PYH98S9LAgO22iFnbeEAS27C9GjWbd2Nf2xm8+vh2YQW0dnfiytNOSVLPz90UMRvPH5LEntxaBWtFlSYgpqeEHIiGkPYH5nGTFkJSWaaFkISHEhpCQmGqv9Mcl5I5PQMvL8zUivVN1fBNT8XFO/bXiYUvIXVAYPLN50UgFIpJymIyI8O4SGyfCv6E1++LU4kNWGK2iO2agFhump3ESkNoXdNB+Kd/pE4IaYVMK2R/PKBoPaDNheKkcUILmZbEyU5i1S4pVb2oT8S2yodRD3bYF2hb5WiHDb1vVLyxpfqtRakVW7LaZVfiZBGUsqv+Aw7VHzGp/pBP9cesQpKo+qBbEKD6qwZREaq97DF7rFXbdZtf5p4EpDaOFPMAAAAASUVORK5CYII=",
        'id': ''
      };
      const typeList = [firstType, ...data].map(type => {
        return {
          ...type,
          'filePath': type.filePath.includes('http') || type.filePath.includes("data:image/png") ? type.filePath : serviceUrl + type.filePath
        };
      });
      this.setState({
        'typeList': typeList
      });
    },
    'checkType'(e) {
      const {
        id
      } = e.currentTarget.dataset;
      this.setState({
        'typeId': id
      });
      this.triggerEvent("changeType", id);
    }
  },
  'lifetimes': {
    'attached'() {
      this.getTypeList();
    }
  }
});