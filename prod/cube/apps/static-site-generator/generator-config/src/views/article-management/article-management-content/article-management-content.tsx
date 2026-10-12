import type { IDomEditor } from "@wangeditor/editor";
import { SlateTransforms, SlateRange } from "@wangeditor/editor";
import { defineComponent, nextTick, onMounted, reactive, ref, shallowRef } from "vue";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type { ArticleCategoryTree } from "@ghcloud/cube-static-site-generator-service";
import { Button, Form, FormItem, Input, Radio, RadioGroup, Textarea, TreeSelect, message, type FormExpose } from "@ghcloud/cube-ui";

import { MaterialSelectModal } from "../../material-management/components/material-select-modal";
import type { Material } from "../../material-management/types";
import { ArticleEditor } from "./components/article-editor";
import type { Article } from "./mock";
import { cubeSiteGeneratorService } from "@/api/service";
import { logger } from "@/logger";

import styles from "./article-management-content.module.less";

type EditorMode = "visual" | "source";

const CATEGORY_TREE_FIELD_NAMES = { label: "categoryName", value: "id", children: "children" } as const;

/** 文章内容编辑 */
export const ArticleManagementContent = defineComponent({
  setup: () => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get("mode");
    const articleId = searchParams.get("id");
    const isEdit = mode === "edit" && articleId;

    const formRenderRef = ref<FormExpose>();
    const submitting = ref(false);
    const loading = ref(false);
    const categoryTree = ref<ArticleCategoryTree[]>([]);
    const editorMode = ref<EditorMode>("visual");
    const editorKey = ref(0);
    const editorRef = shallowRef<IDomEditor>();
    const sourceTextareaRef = ref<HTMLTextAreaElement>();
    const selectModalVisible = ref(false);
    const insertImageTarget = ref<"editor" | "cover">("cover");
    const savedEditorSelection = ref<SlateRange | null>(null);

    const formState = reactive<Article>({
      id: "",
      title: "",
      date: "",
      summary: "",
      categoryId: "",
      categoryName: "",
      coverImageUrl: "",
      author: "",
      content: "",
      sort: 0,
      status: 1,
      createdTime: "",
      updatedTime: "",
    });

    const rules = {
      title: [{ required: true, message: "请输入标题", trigger: "blur" }],
    };

    const resetForm = (): void => {
      formState.id = "";
      formState.title = "";
      formState.date = "";
      formState.summary = "";
      formState.categoryId = undefined;
      formState.categoryName = "";
      formState.coverImageUrl = "";
      formState.author = "";
      formState.content = "";
      formState.sort = 0;
      formState.status = 1;
      formState.createdTime = "";
      formState.updatedTime = "";
      editorKey.value += 1;
    };

    const applyDetail = (detail: Partial<Article>): void => {
      Object.assign(formState, detail);
      editorKey.value += 1;
    };

    const loadCategories = async (): Promise<void> => {
      try {
        categoryTree.value = await cubeSiteGeneratorService.getArticleCategoryTree();
      } catch (error) {
        logger.error("加载分类失败", error);
      }
    };

    const loadArticle = async (): Promise<void> => {
      if (!isEdit || !articleId) {
        return;
      }
      loading.value = true;
      try {
        const detail = await cubeSiteGeneratorService.getArticleDetail({ id: articleId });
        if (detail) {
          applyDetail({
            id: detail.id,
            title: detail.title,
            summary: detail.summary,
            categoryId: detail.categoryId,
            categoryName: detail.categoryName,
            coverImageUrl: detail.coverImageUrl,
            author: detail.author,
            content: detail.content,
            status: detail.status,
          });
        } else {
          message.error("文章不存在");
          handleBack();
        }
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "加载文章失败");
        logger.error("加载文章失败", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadCategories();
      if (isEdit) {
        loadArticle();
      } else {
        resetForm();
      }
    });

    const handleEditorChange = (html: string): void => {
      formState.content = html;
    };

    const handleEditorCreated = (editor: IDomEditor): void => {
      editorRef.value = editor;
    };

    const handleModeChange = (val: EditorMode): void => {
      editorMode.value = val;
      if (editorMode.value === "visual") {
        editorKey.value += 1;
      }
    };

    const handleMaterialSelect = (selected: Material[]): void => {
      const material = selected[0];
      if (!material) {
        return;
      }
      const url = material.url ?? "";
      if (insertImageTarget.value === "editor") {
        insertImageToEditor(url);
      } else {
        formState.coverImageUrl = url;
      }
    };

    const insertImageToEditor = (url: string): void => {
      if (editorMode.value === "visual" && editorRef.value) {
        const editor = editorRef.value;
        if (savedEditorSelection.value) {
          SlateTransforms.select(editor, savedEditorSelection.value);
        }
        editor.focus();
        setTimeout(() => {
          editor.insertNode({
            type: "image",
            src: url,
            alt: "",
            href: "",
            children: [{ text: "" }],
          } as any);
        }, 100);
      } else {
        const imgHtml = `<img src="${url}" style="max-width:100%;" />`;
        const ta = sourceTextareaRef.value;
        if (ta) {
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          formState.content = formState.content.substring(0, start) + imgHtml + formState.content.substring(end);
          nextTick(() => {
            ta.selectionStart = ta.selectionEnd = start + imgHtml.length;
            ta.focus();
          });
        } else {
          formState.content += imgHtml;
        }
      }
    };

    const handleOpenImageModal = (): void => {
      insertImageTarget.value = "editor";
      if (editorRef.value) {
        savedEditorSelection.value = editorRef.value.selection as SlateRange | null;
      }
      selectModalVisible.value = true;
    };

    const handleSubmit = async (): Promise<void> => {
      try {
        await formRenderRef.value?.validate();
      } catch {
        return;
      }

      if (!formState.categoryId) {
        message.error("请选择分类");
        return;
      }

      submitting.value = true;
      try {
        const payload = {
          title: formState.title.trim(),
          categoryId: formState.categoryId,
          coverImageUrl: formState.coverImageUrl,
          summary: formState.summary.trim(),
          content: formState.content,
          author: formState.author.trim(),
          status: formState.status,
        };

        if (isEdit) {
          await cubeSiteGeneratorService.updateArticle({
            ...payload,
            id: articleId!,
          });
          message.success("保存成功");
          logger.info("更新文章", payload);
        } else {
          await cubeSiteGeneratorService.addArticle(payload);
          message.success("创建成功");
          logger.info("新增文章", payload);
        }
        handleBack();
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "保存失败");
        logger.error("保存文章失败", error);
      } finally {
        submitting.value = false;
      }
    };

    const handleBack = (): void => {
      history.pushState({}, "", "/portal/site-generator/article-management/list");
    };

    return (): JSX.Element => {
      const title = isEdit ? "编辑文章" : "新增文章";

      return (
        <CubeLayout title={title}>
          {{
            "layout-content": (): JSX.Element => (
              <div class={styles.formWrapper}>
                <Form model={formState} ref={formRenderRef} rules={rules} labelCol={{ span: 2 }} wrapperCol={{ span: 18 }}>
                  <FormItem label="标题" name="title" required>
                    <Input v-model:value={formState.title} placeholder="请输入文章标题" maxLength={9999} showCount={false} />
                  </FormItem>

                  <FormItem label="摘要" name="summary">
                    <Textarea v-model:value={formState.summary} rows={4} placeholder="请输入文章摘要" />
                  </FormItem>

                  <FormItem label="分类" name="category">
                    <TreeSelect
                      v-model:value={formState.categoryId}
                      treeData={categoryTree.value}
                      fieldNames={CATEGORY_TREE_FIELD_NAMES}
                      placeholder="请选择分类"
                      allowClear={false}
                      treeDefaultExpandAll
                      showSearch
                      treeNodeFilterProp="categoryName"
                      style={{ width: "260px" }}
                    />
                  </FormItem>

                  <FormItem label="封面图" name="image">
                    <div class={styles.imageActions}>
                      {formState.coverImageUrl && <img class={styles.imagePreview} src={formState.coverImageUrl} alt="封面图" />}
                      <Button
                        onClick={() => {
                          insertImageTarget.value = "cover";
                          selectModalVisible.value = true;
                        }}
                      >
                        {formState.coverImageUrl ? "更换素材" : "选择素材"}
                      </Button>
                      {formState.coverImageUrl && (
                        <Button
                          type="link"
                          danger
                          onClick={() => {
                            formState.coverImageUrl = "";
                          }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                  </FormItem>

                  <FormItem label="作者" name="author">
                    <Input v-model:value={formState.author} placeholder="请输入作者" />
                  </FormItem>

                  <FormItem label="正文" name="content">
                    <div class={styles.editorWrapper}>
                      <div class={styles.editorToolbar}>
                        <RadioGroup value={editorMode.value} onChange={handleModeChange}>
                          <Radio value="visual">富文本编辑</Radio>
                          <Radio value="source">源码编辑</Radio>
                        </RadioGroup>
                        <Button onClick={handleOpenImageModal}>插入图片</Button>
                      </div>
                      {editorMode.value === "visual" ? (
                        <ArticleEditor
                          key={editorKey.value}
                          text={formState.content}
                          height={400}
                          onGetHtml={handleEditorChange}
                          onOnCreated={handleEditorCreated}
                        />
                      ) : (
                        <textarea
                          ref={sourceTextareaRef}
                          v-model={formState.content}
                          class={styles.sourceEditor}
                          rows={18}
                          placeholder="请输入 HTML 代码"
                        />
                      )}
                    </div>
                  </FormItem>
                </Form>

                <MaterialSelectModal
                  v-model:visible={selectModalVisible.value}
                  mode="single"
                  title="选择素材"
                  onConfirm={handleMaterialSelect}
                />
              </div>
            ),
            "footer-page": (): JSX.Element => (
              <div class={styles.footerActions}>
                <Button onClick={handleBack}>返回</Button>
                <Button type="primary" loading={submitting.value} onClick={handleSubmit}>
                  保存
                </Button>
              </div>
            ),
          }}
        </CubeLayout>
      );
    };
  },
});
