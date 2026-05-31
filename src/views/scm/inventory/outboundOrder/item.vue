<template>
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="visable" :title="'入库详情'" width="500px">
    <el-form ref="form" :model="formData" :rules="rules" size="small" label-width="80px">
      <el-row type="flex" :gutter="15">
        <el-col :span="12">
          <el-form-item label="批号" prop="batchNo">
            <el-input v-model="formData.batchNo" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量" prop="qty">
            <el-input-number v-model.number="formData.qty" :min="0" :max="50" :step="0.1" style="width:100%" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="15">
        <el-col :span="12">
          <el-form-item label="物料" prop="part.id">
            <el-select v-model="formData.part.id" clearable placeholder="请选择物料">
              <el-option v-for="item in parts" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓位" prop="stockPlace.id">
            <el-select v-model="formData.stockPlace.id" clearable placeholder="请选择仓位">
              <el-option v-for="item in stockPlaces" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="15">
        <el-col :span="12">
          <el-form-item label="状态" prop="state">
            <el-select v-model="formData.state" clearable size="small" placeholder="状态">
              <el-option v-for="item in stateTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model.number="formData.sort" :min="0" :max="80" style="width:100%" controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button type="text" @click="handleCancel()">取消</el-button>
      <el-button :loading="loading" type="primary" @click="handleSave()">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getStockPlaceList } from '@/api/scm/base/stockPlace'
import { getPartList } from '@/api/scm/base/part'
export default {
  props: {
    visable: {
      type: Boolean,
      default: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false, formData: { id: null, masterId: null, part: { id: null }, batchNo: null, qty: 1, state: 0, stockPlace: { id: null }, sort: 1 },
      rules: {
        batchNo: [
          { required: true, message: '批号不能为空', trigger: 'blur' }
        ],
        qty: [
          { required: true, message: '数量不能为空', trigger: 'blur' }
        ],
        state: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序不能为空', trigger: 'blur' }
        ],
        'part.id': [
          { required: true, message: '物料不能为空', trigger: 'blur' }
        ],
        'stockPlace.id': [
          { required: true, message: '仓位不能为空', trigger: 'blur' }
        ]
      },
      stockPlaces: [], parts: [],
      stateTypeOptions: [
        { key: 0, display_name: '不合格' },
        { key: 1, display_name: '合格' },
        { key: 2, display_name: '紧急放行' },
        { key: 3, display_name: '待检' },
        { key: 4, display_name: '返工返修' },
        { key: 5, display_name: '降级使用' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.formData = { id: null, masterId: null, part: { id: null, name: null }, batchNo: null, qty: 1, state: 0, stockPlace: { id: null, name: null }, sort: 1 }
      if (this.data.id || this.data.batchNo) {
        this.formData = Object.assign({}, this.data)
      }
      this.handlePart()
      this.handleStockPlace()
    })
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
    },
    handleFindName(array, paramer) {
      const o = array.find(e => e.id === this.formData[paramer].id)
      return o ? o.name : ''
    },
    handleSave() {
      this.$refs['form'].validate(val => {
        if (!val) { return }
        this.formData.stockPlace.name = this.handleFindName(this.stockPlaces, 'stockPlace')
        this.formData.part.name = this.handleFindName(this.parts, 'part')
        this.$emit(!this.data.batchNo ? 'create' : 'update', this.formData)
      })
    },
    handleStockPlace() {
      this.stockPlaces = []
      getStockPlaceList().then(res => {
        this.stockPlaces = res.content
      })
    },
    handlePart() {
      this.parts = []
      getPartList().then(res => {
        this.parts = res.content
      })
    }
  }
}
</script>

<style scoped>
</style>
