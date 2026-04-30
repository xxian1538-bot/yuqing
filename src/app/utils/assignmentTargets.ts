export const assignmentTargetGroups = [
  {
    key: 'person',
    label: '人员',
    options: [
      { id: 'person:zhang_chen', label: '张晨', description: '市场监管组' },
      { id: 'person:li_yun', label: '李昀', description: '物流保障组' },
      { id: 'person:wang_qi', label: '王琪', description: '法规宣传组' },
      { id: 'person:zhou_min', label: '周敏', description: '网评中心' },
    ],
  },
  {
    key: 'role',
    label: '角色',
    options: [
      { id: 'role:spokesperson', label: '发言人', description: '统一口径回应' },
      { id: 'role:commentator', label: '网评员', description: '执行舆论引导' },
      { id: 'role:analyst', label: '研判专员', description: '补充分析支撑' },
    ],
  },
  {
    key: 'organization',
    label: '组织',
    options: [
      { id: 'organization:marketing_center', label: '营销中心', description: '市场与客户服务' },
      { id: 'organization:logistics_center', label: '物流中心', description: '配送与应急保障' },
      { id: 'organization:inspection_team', label: '专卖稽查支队', description: '专卖监管执行' },
    ],
  },
  {
    key: 'position',
    label: '职位',
    options: [
      { id: 'position:section_chief', label: '科室负责人', description: '统筹处置安排' },
      { id: 'position:duty_manager', label: '值班经理', description: '跟进现场响应' },
      { id: 'position:team_lead', label: '班组长', description: '组织具体执行' },
    ],
  },
] as const;

export function getAssignmentTargetLabel(targetId: string) {
  for (const group of assignmentTargetGroups) {
    const option = group.options.find((item) => item.id === targetId);
    if (option) {
      return `${group.label}：${option.label}`;
    }
  }

  return targetId;
}

export function getAssignmentTargetLabels(targetIds: string[] = []) {
  return targetIds.map(getAssignmentTargetLabel);
}

export function getAssignmentDisplayName(targetIds?: string[], fallback?: string) {
  if (targetIds && targetIds.length > 0) {
    return getAssignmentTargetLabels(targetIds).join('、');
  }

  return fallback || '未记录';
}
