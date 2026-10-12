import { computed, defineComponent, ref, watch } from "vue";

import { FileUpload } from "@ghcloud/cube-app-design";
import { Textarea } from "@ghcloud/cube-ui";

import { SKILL_LONG_TEXTAREA_PROPS } from "./skill-data";
import {
  SKILL_REFERENCE_ACCEPT_TYPES,
  SKILL_REFERENCE_MAX_COUNT,
  SKILL_REFERENCE_MAX_SIZE_MB,
  SKILL_REFERENCE_UPLOAD_SCENE,
  ossFilesToSkillReference,
  parseSkillReference,
  serializeSkillReference,
  skillReferenceToOssFiles,
  type SkillReferenceOssFile,
} from "./skill-reference";

import styles from "./skill-management.module.less";

export const SkillReferenceEditor = defineComponent({
  name: "SkillReferenceEditor",
  props: {
    value: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    noteRows: {
      type: Number,
      default: 2,
    },
    showNote: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:value"],
  setup(props, { emit }) {
    const ossFiles = ref<SkillReferenceOssFile[]>([]);
    const note = ref("");

    const syncFromValue = (raw: string): void => {
      const parsed = parseSkillReference(raw);
      ossFiles.value = skillReferenceToOssFiles(parsed.files);
      note.value = parsed.note ?? "";
    };

    watch(
      () => props.value,
      (raw) => {
        syncFromValue(raw ?? "");
      },
      { immediate: true },
    );

    const emitSerialized = (files: SkillReferenceOssFile[], nextNote: string): void => {
      emit(
        "update:value",
        serializeSkillReference({
          files: ossFilesToSkillReference(files),
          note: nextNote,
        }),
      );
    };

    const accept = computed(() => SKILL_REFERENCE_ACCEPT_TYPES.join(","));

    return () => (
      <div class={styles.referenceEditor}>
        <FileUpload
          readonly={props.readonly}
          sceneCode={SKILL_REFERENCE_UPLOAD_SCENE}
          useTemporaryUpload
          multiple
          maxCount={SKILL_REFERENCE_MAX_COUNT}
          type="picture-card"
          showText
          size={SKILL_REFERENCE_MAX_SIZE_MB}
          accept={accept.value}
          typeList={[...SKILL_REFERENCE_ACCEPT_TYPES]}
          customText="支持图片、文档等参考资料|单个附件最大100MB"
          value={ossFiles.value}
          onUpdate:value={(files: SkillReferenceOssFile[]) => {
            ossFiles.value = files ?? [];
            emitSerialized(ossFiles.value, note.value);
          }}
        />
        {props.showNote ? (
          <div class={styles.referenceNoteBlock}>
            <div class={styles.referenceNoteLabel}>补充说明（可选）</div>
            <Textarea
              readonly={props.readonly}
              value={note.value}
              rows={props.noteRows}
              placeholder="可补充参考资料的使用说明，例如：优先参照模板 A 的格式"
              {...SKILL_LONG_TEXTAREA_PROPS}
              onUpdate:value={(value: string) => {
                note.value = value ?? "";
                emitSerialized(ossFiles.value, note.value);
              }}
            />
          </div>
        ) : null}
      </div>
    );
  },
});
