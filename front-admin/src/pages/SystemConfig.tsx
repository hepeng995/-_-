import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { MobileDataCard } from '../components/ui/MobileDataCard';
import * as configApi from '../api/system-config';
import type { SystemConfig as ConfigType } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

export default function SystemConfig() {
  const toast = useToast();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [configs, setConfigs] = useState<Record<string, ConfigType[]>>({});
  const [groups, setGroups] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigType | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({ configName: '', configKey: '', configValue: '', configType: 'text', groupName: '', sort: 1, remark: '' });
  const [editForm, setEditForm] = useState({ configName: '', configKey: '', configValue: '', configType: 'text', groupName: '', sort: 1, remark: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupRes, configRes] = await Promise.all([
        configApi.getAllGroups(),
        configApi.getConfigsByGroup(),
      ]);
      if (groupRes.code === 200 && groupRes.data) {
        setGroups(groupRes.data);
        if (groupRes.data.length > 0 && !activeTab) setActiveTab(groupRes.data[0]);
      }
      if (configRes.code === 200 && configRes.data) {
        setConfigs(configRes.data);
      }
    } catch (e) {
      console.error('获取配置失败:', e);
    }
  };

  const handleValueChange = async (configKey: string, newValue: string) => {
    try {
      await configApi.updateConfigValue(configKey, newValue);
      // 更新本地状态
      setConfigs(prev => {
        const next = { ...prev };
        for (const g in next) {
          next[g] = next[g].map(c => c.configKey === configKey ? { ...c, configValue: newValue } : c);
        }
        return next;
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '保存失败');
    }
  };

  const handleSaveValue = (item: ConfigType) => {
    handleValueChange(item.configKey, item.configValue);
  };

  const handleRefreshCache = async () => {
    try {
      await configApi.refreshCache();
      toast.success('缓存刷新成功');
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '刷新失败');
    }
  };

  const handleEditClick = (config: ConfigType) => {
    setEditingConfig(config);
    setEditForm({
      configName: config.configName, configKey: config.configKey,
      configValue: config.configValue, configType: config.configType,
      groupName: config.groupName, sort: config.sort, remark: config.remark || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingConfig) return;
    setSaving(true);
    try {
      await configApi.updateConfig({ ...editingConfig, ...editForm, id: editingConfig.id });
      setIsEditModalOpen(false);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      await configApi.addConfig(addForm as any);
      setIsAddModalOpen(false);
      setAddForm({ configName: '', configKey: '', configValue: '', configType: 'text', groupName: '', sort: 1, remark: '' });
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '新增失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!await confirm({ message: '确定要删除此配置吗？', type: 'danger' })) return;
    try {
      await configApi.deleteConfig(id);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || '删除失败');
    }
  };

  const currentConfigs = configs[activeTab] || [];

  const TYPE_MAP: Record<string, string> = { text: '文本', number: '数字', boolean: '布尔', select: '选择', date: '日期' };

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
          <h2 className="mb-1 text-xl font-medium text-gray-800">系统参数设置</h2>
          <p className="text-sm text-gray-500">配置系统的各项参数，修改后需刷新缓存生效</p>
        </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <button onClick={() => setIsAddModalOpen(true)} className="rounded-2xl bg-bamboo-500 px-4 py-2 text-sm text-white transition-colors hover:bg-bamboo-400 sm:rounded">新增配置</button>
            <button onClick={handleRefreshCache} className="rounded-2xl bg-sprout-500 px-4 py-2 text-sm text-white transition-colors hover:bg-sprout-400 sm:rounded">刷新缓存</button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-lg shadow-sm">
        <div className="scrollbar-hide flex overflow-x-auto border-b border-gray-200 px-4 pt-4 sm:px-6">
          {groups.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`relative min-w-fit px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${activeTab === tab ? 'text-bamboo-500' : 'text-gray-600 hover:text-gray-800'}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-bamboo-500"></div>}
            </button>
          ))}
        </div>

        <div className="hidden p-6 md:block">
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-[200px] border-r border-gray-200">参数名称</th>
                <th className="px-4 py-3 w-[200px] border-r border-gray-200">参数键名</th>
                <th className="px-4 py-3 border-r border-gray-200">参数值</th>
                <th className="px-4 py-3 w-[120px] border-r border-gray-200">参数类型</th>
                <th className="px-4 py-3 w-[180px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {currentConfigs.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-gray-600 border-r border-gray-200">{item.configName}</td>
                  <td className="px-4 py-4 text-gray-600 border-r border-gray-200">{item.configKey}</td>
                  <td className="px-4 py-4 border-r border-gray-200">
                    <input type="text" value={item.configValue}
                      onChange={(e) => {
                        setConfigs(prev => {
                          const next = { ...prev };
                          next[activeTab] = next[activeTab].map(c => c.id === item.id ? { ...c, configValue: e.target.value } : c);
                          return next;
                        });
                      }}
                      className="w-full border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500 text-gray-700" />
                  </td>
                  <td className="px-4 py-4 border-r border-gray-200">
                    <span className="px-3 py-1 bg-bamboo-50 text-bamboo-500 border border-bamboo-200 rounded text-xs">
                      {TYPE_MAP[item.configType] || item.configType}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleSaveValue(item)} className="text-bamboo-500 hover:text-blue-600 transition-colors">保存</button>
                      <button onClick={() => handleEditClick(item)} className="text-sprout-500 hover:text-green-600 transition-colors">编辑</button>
                      <button onClick={() => handleDelete(item.id)} className="text-terracotta-500 hover:text-red-600 transition-colors">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentConfigs.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">暂无配置</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {currentConfigs.length === 0 && <Card className="p-8 text-center text-sm text-gray-400">暂无配置</Card>}
          {currentConfigs.map((item) => (
            <MobileDataCard
              key={item.id}
              title={item.configName}
              subtitle={item.configKey}
              tags={[
                <span key="type" className="rounded-full border border-bamboo-200 bg-bamboo-50 px-2 py-0.5 text-[11px] text-bamboo-500">
                  {TYPE_MAP[item.configType] || item.configType}
                </span>,
                <span key="group" className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                  {item.groupName}
                </span>,
              ]}
              fields={[
                {
                  label: '参数值',
                  value: (
                    <input
                      type="text"
                      value={item.configValue}
                      onChange={(e) => {
                        setConfigs((prev) => {
                          const next = { ...prev };
                          next[activeTab] = next[activeTab].map((config) =>
                            config.id === item.id ? { ...config, configValue: e.target.value } : config,
                          );
                          return next;
                        });
                      }}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"
                    />
                  ),
                  fullWidth: true,
                },
              ]}
              details={[
                { label: '排序', value: item.sort },
                { label: '备注说明', value: item.remark || '-', fullWidth: true },
              ]}
              actions={[
                { label: '保存', onClick: () => handleSaveValue(item), tone: 'primary' },
                { label: '编辑', onClick: () => handleEditClick(item), tone: 'success' },
                { label: '删除', onClick: () => handleDelete(item.id), tone: 'danger' },
              ]}
            />
          ))}
        </div>
      </Card>

      {/* 编辑弹窗 */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="编辑配置" className="max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>参数名称</label>
            <input type="text" value={editForm.configName} onChange={(e) => setEditForm({...editForm, configName: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>参数键名</label>
            <input type="text" value={editForm.configKey} disabled className="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>参数值</label>
            <input type="text" value={editForm.configValue} onChange={(e) => setEditForm({...editForm, configValue: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">参数类型</label>
              <select value={editForm.configType} onChange={(e) => setEditForm({...editForm, configType: e.target.value})} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500">
                <option value="text">文本</option><option value="number">数字</option><option value="boolean">布尔</option><option value="select">选择</option><option value="date">日期</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">分组名称</label>
              <input type="text" value={editForm.groupName} onChange={(e) => setEditForm({...editForm, groupName: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">排序</label>
            <input type="number" value={editForm.sort} onChange={(e) => setEditForm({...editForm, sort: Number(e.target.value)})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">备注说明</label>
            <textarea value={editForm.remark} onChange={(e) => setEditForm({...editForm, remark: e.target.value})} rows={3} className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"></textarea>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button onClick={() => setIsEditModalOpen(false)} className="w-full rounded-2xl border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleEditSave} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-5 py-2 text-sm text-white hover:bg-bamboo-400 disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '保存中...' : '确定'}</button>
          </div>
        </div>
      </Modal>

      {/* 新增弹窗 */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="新增配置" className="max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>参数名称</label>
            <input type="text" value={addForm.configName} onChange={(e) => setAddForm({...addForm, configName: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>参数键名</label>
            <input type="text" value={addForm.configKey} onChange={(e) => setAddForm({...addForm, configKey: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>参数值</label>
            <input type="text" value={addForm.configValue} onChange={(e) => setAddForm({...addForm, configValue: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">参数类型</label>
              <select value={addForm.configType} onChange={(e) => setAddForm({...addForm, configType: e.target.value})} className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500">
                <option value="text">文本</option><option value="number">数字</option><option value="boolean">布尔</option><option value="select">选择</option><option value="date">日期</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700"><span className="mr-1 text-red-500">*</span>分组名称</label>
              <input type="text" value={addForm.groupName} onChange={(e) => setAddForm({...addForm, groupName: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">排序</label>
            <input type="number" value={addForm.sort} onChange={(e) => setAddForm({...addForm, sort: Number(e.target.value)})} className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">备注说明</label>
            <textarea value={addForm.remark} onChange={(e) => setAddForm({...addForm, remark: e.target.value})} rows={3} className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-bamboo-500/40 focus-visible:border-bamboo-500"></textarea>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button onClick={() => setIsAddModalOpen(false)} className="w-full rounded-2xl border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:w-auto sm:rounded">取消</button>
            <button onClick={handleAdd} disabled={saving} className="w-full rounded-2xl bg-bamboo-500 px-5 py-2 text-sm text-white hover:bg-bamboo-400 disabled:opacity-50 sm:w-auto sm:rounded">{saving ? '新增中...' : '确定'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
