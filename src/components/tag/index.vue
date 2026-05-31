<template>
  <div>
    <el-dialog title="图片素材库" append-to-body :visible.sync="dialogVisible" width="80%">
      <el-container :style="dialogStyle">
        <el-aside width="unset">
          <el-tabs v-model="tagCategoryId" v-loading="categoryLoading" tab-position="left" @tab-click="tabClick">
            <el-tab-pane v-for="item in tag_categories" :key="item.id" :name="item.id">
              <span slot="label"> {{ item.name }}</span>
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <el-main>
          <el-card>
            <div slot="header">
              <el-row>
                <el-col :span="15">
                  <span>常用标签</span>
                </el-col>
                <el-col :span="1">&nbsp;</el-col>
                <el-col :span="8">
                  <span>选中的标签</span>
                </el-col>
              </el-row>
            </div>
            <div v-loading="tableLoading">
              <el-scrollbar :style="scrollStyle">
                <el-row>
                  <el-col :span="15">
                    <div>
                      <el-button v-for="item in tags" :key="item.id" size="small" type="ghost" class="tab_button" @click="checkTag(item)">{{ item.name }}</el-button>
                      <p v-if="tags.length < 1">暂无数据</p>
                    </div>
                  </el-col>
                  <el-col :span="1">&nbsp;</el-col>
                  <el-col :span="8">
                    <div>
                      <el-tag v-for="(item, index) in selected_tags" :key="item.id" effect="dark" closable class="tab_button" :type="types[index%types.length]" @close="onRemoveSelectedTag(index)">{{ item.name }}</el-tag>
                      <p v-if="selected_tags.length < 1">暂无数据</p>
                    </div>
                  </el-col>
                </el-row>
              </el-scrollbar>
            </div>
          </el-card>
        </el-main>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button type="text" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="saveTags">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import crudTag from '@/api/cms/base/tag'
import crudTagCategory from '@/api/cms/base/tagCategory'

export default {
  name: 'KbTag',
  props: {
    tagsExisted: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      tags: [],
      selected_tags: [],
      tag_type: 1,
      types: ['success', 'info', 'waring', 'danger'],
      dialogVisible: true,
      url: '',
      tag_categories: [],
      tagCategoryId: '',
      categoryObj: {},
      categoryLoading: false,
      tableData: [],
      resultNumber: 0,
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 50, // 每页显示多少条
        descs: 'create_time'// 降序字段
      },
      tableLoading: false,
      groupId: null,
      urls: [],
      dialogStyle: { height: '290px', overflow: 'auto' },
      scrollStyle: { height: '290px', marginBottom: '13px' }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.tagCategoryList()
      const clientHeight = document.documentElement.clientHeight
      const marginTop = clientHeight * 0.25
      const dialogHeight = clientHeight - marginTop - 54 - 62
      this.dialogStyle.height = dialogHeight + 'px'
      this.scrollStyle.height = (dialogHeight - 60 - 50) + 'px'
    })
  },
  methods: {
    tagCategoryList() {
      this.categoryLoading = true
      crudTagCategory.getTagCategories({
        currentPage: 1, // 当前页数
        pageSize: 100, // 每页显示多少条
        descs: 'create_time'// 降序字段
      }).then(response => {
        this.categoryLoading = false
        const groups = response.content
        groups.unshift({
          id: '-1',
          name: '所有标签'
        })
        this.tag_categories = groups
        this.tabClick({
          index: 0
        })
      })
    },
    tabClick(tab, event) {
      const index = Number(tab.index)
      const categoryObj = this.tag_categories[index]
      categoryObj.index = index
      this.categoryObj = categoryObj
      this.tagCategoryId = categoryObj.id
      this.page.currentPage = 1
      this.page.total = 0
      if (categoryObj.id !== '-1') {
        this.groupId = categoryObj.id
      } else {
        this.groupId = null
      }
      this.getTagList(this.page)
    },
    getTagList(page, params) {
      this.tableLoading = true
      crudTag.getTags(Object.assign({
        page: page.currentPage - 1,
        size: page.pageSize,
        descs: this.page.descs
      }, {
        tagCategoryId: this.groupId
      })).then(response => {
        const tableData = response.content
        this.page.total = response.totalElements
        this.page.currentPage = page.currentPage
        this.page.pageSize = page.pageSize
        this.tags = tableData
        this.selected_tags = this.tagsExisted
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    },
    checkTag(tag) {
      this.processSelectTag(tag)
    },
    saveTags() {
      this.selected_tags.forEach(element => {
        element.tagCategoryId = this.tag_categories[this.tag_categories.length - 1].id
      })
      this.$emit('on-select-tags', this.selected_tags)
    },
    onRemoveSelectedTag(index) {
      this.selected_tags.splice(index, 1)
    },
    handleCancel() {
      this.$emit('on-cancel')
    },
    processSelectTag(tag) {
      // 判断该标签是否已经选择过
      const existTag = this.selected_tags.find(element => {
        return element.id === tag.id
      })
      if (!existTag) {
        this.selected_tags.push(tag)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tab_button {
    margin-left: 5px;
    margin-bottom: 5px;
}
.el-aside {
  margin-bottom: 0;
}
.el-main {
    padding: 0px 0px 0px 20px;
}
::v-deep .el-icon-circle-close {
    color: red;
}
.material-name {
    padding: 8px 0px;
}
.col-do {
    text-align: center;
}
.button-do {
    padding: unset !important;
    font-size: 12px;
}
</style>
