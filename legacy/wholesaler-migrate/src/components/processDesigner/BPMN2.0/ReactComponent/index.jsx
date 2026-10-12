import React from 'react';
import { Button, Upload, message  } from 'antd';
// import { history, ConnectProps, connect } from 'umi';

import CustomModeler from '../index.js';
// 右侧属性栏
import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";
// react 属性栏
import ReactPropertiesPanel from './PropertiesPanel/propertiesPanel.jsx';
import { customDescriptors } from '../config.default.js'

import styles from './index.less';
// import '../style.default.less';

import { getBpmnXml } from '@/services/bpmn';
class BpmnComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            selectedElements: null,
            element: null,
            modeler: null,
        };
    }
    bpmnModeler = null;
    someMothed() {
    };
    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            this.getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loading: false,
                }),
            );
        }
    };
    getBase64(img, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    beforeUpload(file) {
        // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        // if (!isJpgOrPng) {
        //     message.error('You can only upload JPG/PNG file!');
        // }
        // const isLt2M = file.size / 1024 / 1024 < 2;
        // if (!isLt2M) {
        //     message.error('Image must smaller than 2MB!');
        // }
        // return isJpgOrPng && isLt2M;
        const isXml = /\.bpmn|\.xml/g.test(file.name);
        if (!isXml) {
            message.error('You must upload a bpmn or xml!');
        }
        return isXml;
    }
    render() {
        const {
            modeler
        } = this.state;
        return (
            <div className={styles.main}>
                <div ref="container" className={styles.canvas}>

                </div>
                <div ref="proerties" className={styles.right}>
                    {!!modeler && <ReactPropertiesPanel modeler={modeler}></ReactPropertiesPanel>}
                </div>
                <div className={styles.bottons}>
                    <Button type="primary"
                        title="save to xml"
                        onClick={() => {
                            this.bpmnModeler.saveXML({ format: true })
                                .then((res) => {
                                }).catch((err) => {
                                });
                        }}
                    ><span className="icon iconfont icon-yunduanxiazai"></span>
                    </Button>
                    <Upload
                        beforeUpload={this.beforeUpload}
                        onChange={this.handleChange}
                        showUploadList={false}>
                        <Button type="primary"
                            title="open BPMN xml"
                        ><span className="icon iconfont icon-dakai"></span>
                        </Button>
                    </Upload>

                </div>
            </div>);
    };
    async componentDidMount() {
        this.bpmnModeler = new CustomModeler({
            container: this.refs.container,
            //添加控制板
            // propertiesPanel: {
            //     parent: this.refs.proerties
            // },
            additionalModules: [
                // 右边的属性栏
                // propertiesProviderModule,
                // propertiesPanelModule,
                // customPropertiesProviderModule,
            ],
            moddleExtensions: {
                // camunda: camundaModdleDescriptor,
                ghy: customDescriptors.ghy,
                custom: customDescriptors.customProperties
            }
        });
        this.setState({ modeler: this.bpmnModeler, });
        // getBpmnXml().then((res) => {
        // }).catch((e) => {
        // });

        let res = await getBpmnXml();
        let bpmnModeler = this.bpmnModeler;
        let modeling = bpmnModeler.get('modeling');
        this.bpmnModeler.importXML(res).then((res) => {
            if (res?.warnings?.length) {
            } else {
                this.bpmnModeler.on('element.click', e => {

                    // var elementRegistry = this.bpmnModeler.get('elementRegistry')
                    // var shape = e.element ? elementRegistry.get(e.element.id) : e.shape;
                    // modeling.updateProperties(shape, {
                    //     name: '新名字2334',
                    //     url: 'XXXX',
                    //     method: 'GET',
                    //     isLogin: false,
                    //     timeout: 1000,
                    //     users: [
                    //         'am',
                    //         'bm',
                    //         'cm',
                    //         1000
                    //     ]
                    // });

                });
                
                // this.bpmnModeler.on('selection.changed', (e) => {
                //     this.setState({
                //         selectedElements: e.newSelection,
                //         element: e.newSelection[0] // --------------------- 设置 element 的值 ---------------------------------
                //     });
                // });
                const eventTyps = [
                    "commandStack.element.updateProperties.postExecute",
                    "commandStack.element.updateProperties.postExecuted",
                    "element.changed",
                    "propertiesPanel.changed",
                    "shape.changed",
                    "elementTemplates.changed", 
                    "elements.changed",
                ];
                // eventTyps.forEach( (eventType) => {
                //     this.bpmnModeler.on(eventType, (e) => {
                //     });
                // });
                
            }
        });

    };
    saveToXml() {

    }
};
export default BpmnComponent;