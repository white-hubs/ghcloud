import { H5sPlayerWS, H5sPlayerHls, H5sPlayerRTC } from './h5splayer.js';
import Vue from 'vue';
import { loadCurrentProject } from '@/services/AccountService';
/**
 * Check on iOS platform
 */
function H5siOS() {
  var iDevices = [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ];

  if (navigator.platform) {
    while (iDevices.length) {
      if (navigator.platform === iDevices.pop()) {
        return true;
      }
    }
  }

  return false;
}

/**
 *=================H5Player Create
 *
 */

async function H5sPlayerCreate(conf) {
  var player;
  const project = await loadCurrentProject(); //视频：需要加session 所以直接改js文件，这里是获取项目id

  let session = await Vue.prototype.$restful(
    'GET:/project-merchant/streamconfig/getStreamSesson',
    {
      projectId: project.id,
    },
  ); //发送接口，获取session
  conf = { ...conf, session };
  if (H5siOS()) {
    player = new H5sPlayerHls(conf);
  } else {
    player = new H5sPlayerWS(conf);
  }
  return player;
}

/**
 *=================H5Player Delete
 *
 */
function H5sPlayerDelete(player) {
  // delete player;

  return true;
}

export { H5siOS, H5sPlayerCreate };
