import { defineComponent } from "vue";

import { formatSkillReferenceSummary, isImageReferenceFile, parseSkillReference } from "./skill-reference";

import styles from "./skill-management.module.less";

export const SkillReferenceDisplay = defineComponent({
  name: "SkillReferenceDisplay",
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () => {
      const data = parseSkillReference(props.value);
      if (data.files.length === 0 && !data.note?.trim()) {
        return <span class={styles.configItemEmpty}>暂无配置</span>;
      }

      return (
        <div class={styles.referenceDisplay}>
          {data.files.length > 0 ? (
            <ul class={styles.referenceFileList}>
              {data.files.map((file) => (
                <li key={file.id} class={styles.referenceFileItem}>
                  {isImageReferenceFile(file) ? (
                    <a class={styles.referenceImageLink} href={file.path} target="_blank" rel="noopener noreferrer">
                      <img class={styles.referenceImageThumb} src={file.path} alt={file.name} />
                    </a>
                  ) : null}
                  <a class={styles.referenceFileLink} href={file.path} target="_blank" rel="noopener noreferrer" title={file.name}>
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div class={styles.referenceSummary}>{formatSkillReferenceSummary(props.value)}</div>
          )}
          {data.note?.trim() ? <div class={styles.referenceNoteDisplay}>{data.note.trim()}</div> : null}
        </div>
      );
    };
  },
});
