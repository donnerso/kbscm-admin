<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable placeholder="输入频道名称搜索" style="width: 175px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.isEffective" clearable size="small" placeholder="是否有效" class="filter-item" style="width: 100px" @change="crud.toQuery">
          <el-option v-for="item in dict.channel_status" :key="item.id" :label="item.label" :value="item.value" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
    </div>
    <!--表单组件-->
    <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="550px">
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属站点" prop="site.id">
              <el-select v-model="form.site.id" clearable size="small" placeholder="请选择站点" style="width: 100%;">
                <el-option v-for="item in sites" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="12">
            <el-form-item label="上级频道">
              <treeselect v-model="form.parentId" :options="channels" placeholder="选择上级频道" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否有效" prop="isEffective">
              <el-radio v-for="item in dict.channel_status" :key="item.id" v-model="form.isEffective" :label="item.value">{{ item.label }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="外部链接" prop="url">
              <el-input v-model="form.url" type="url" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row type="flex" :gutter="15">
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="form.description" :rows="3" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" size="small" style="width: 100%;" row-key="id" @select="crud.selectChange" @select-all="crud.selectAllChange" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="频道名称" />
      <el-table-column prop="siteId" label="所属站点">
        <template slot-scope="scope">
          {{ scope.row.site.name }}
        </template>
      </el-table-column>
      <el-table-column prop="isEffective" label="是否有效">
        <template slot-scope="scope">
          {{ dict.label.channel_status[scope.row.isEffective] }}
        </template>
      </el-table-column>
      <el-table-column prop="createBy" label="创建人" />
      <el-table-column prop="updateTime" label="修改时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','channel:edit','channel:del']" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudChannel from '@/api/cms/base/channel'
import { getSites } from '@/api/cms/base/site'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, description: null, parentId: '', url: null, site: {}, isEffective: 'true' }
export default {
  name: 'Channel',
  components: { pagination, crudOperation, rrOperation, udOperation, Treeselect },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['channel_status'],
  cruds() {
    return CRUD({ title: '频道', url: 'api/channel', sort: 'id,desc', crudMethod: { ...crudChannel }})
  },
  data() {
    return {
      channels: [], sites: [],
      permission: {
        add: ['admin', 'channel:add'],
        edit: ['admin', 'channel:edit'],
        del: ['admin', 'channel:del']
      },
      rules: {
        name: [
          { required: true, message: '频道名称不能为空', trigger: 'blur' }
        ],
        'site.id': [
          { required: true, message: '所属站点不能为空', trigger: 'blur' }
        ],
        isEffective: [
          { required: true, message: '是否有效不能为空', trigger: 'blur' }
        ],
        url: [
          { type: 'url', message: '链接地址格式不正确', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '频道名称' },
        { key: 'isEffective', display_name: '是否有效' }
      ]
    }
  },
  methods: {
    [CRUD.HOOK.afterToCU](crud, form) {
      this.handleChannels()
      this.handleSites()
      form.isEffective = `${form.isEffective}`
      form.parentId = form.parentId == null ? '' : form.parentId
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU](crud) {
      if (crud.form.parentId == null) {
        this.$message({
          message: '上级频道不能为空',
          type: 'warning'
        })
        return false
      }
    },
    handleSites() {
      this.sites = []
      getSites().then(res => {
        this.sites = res.content
      })
    },
    handleChannels() {
      crudChannel.getChannels().then(res => {
        this.channels = []
        const dept = { id: '', label: '顶级类目', children: [] }
        dept.children = res.content
        this.channels.push(dept)
      })
    }
  }
}
</script>

<style scoped>
</style>
