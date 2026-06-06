import { useEffect, useState } from "react";
import {
  Globe,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import { publishApi } from "@/api";
import type { PublishSite, PublishJob } from "@/types";

export function PublishingPage() {
  const [sites, setSites] = useState<PublishSite[]>([]);
  const [jobs, setJobs] = useState<PublishJob[]>([]);
  const [activeTab, setActiveTab] = useState<"schedule" | "sites" | "config">(
    "schedule"
  );

  useEffect(() => {
    loadSites();
    loadJobs();
  }, []);

  const loadSites = async () => {
    try {
      const data = await publishApi.sites();
      setSites(data);
    } catch (error) {
      console.error("Failed to load sites:", error);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await publishApi.jobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    }
  };

  const handlePrecheck = async (jobId: string) => {
    try {
      await publishApi.precheck(jobId);
      loadJobs();
    } catch (error) {
      console.error("Failed to run precheck:", error);
    }
  };

  const handlePublish = async (jobId: string) => {
    try {
      await publishApi.publish(jobId);
      loadJobs();
    } catch (error) {
      console.error("Failed to publish:", error);
    }
  };

  const statusIcons: Record<string, typeof CheckCircle> = {
    scheduled: Clock,
    checking: RefreshCw,
    publishing: Play,
    published: CheckCircle,
    failed: AlertTriangle,
  };

  const statusLabels: Record<string, string> = {
    scheduled: "待发布",
    checking: "检查中",
    publishing: "发布中",
    published: "已发布",
    failed: "失败",
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">发布中心</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Calendar className="w-4 h-4" />
          新建发布任务
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "schedule"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          发布排期
        </button>
        <button
          onClick={() => setActiveTab("sites")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "sites"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          站点配置
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            activeTab === "config"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          AI 配置
        </button>
      </div>

      {/* Content */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无发布任务</p>
            </div>
          ) : (
            jobs.map((job) => {
              const StatusIcon = statusIcons[job.status] || Clock;
              return (
                <div
                  key={job.id}
                  className="p-4 bg-card rounded-lg border flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <StatusIcon
                      className={`w-5 h-5 ${
                        job.status === "published"
                          ? "text-green-500"
                          : job.status === "failed"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="font-medium">章节 ID: {job.chapterId}</p>
                      <p className="text-sm text-muted-foreground">
                        站点 ID: {job.siteId} | 计划时间:{" "}
                        {new Date(job.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        job.status === "published"
                          ? "bg-green-100 text-green-800"
                          : job.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : job.status === "publishing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[job.status]}
                    </span>

                    {job.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => handlePrecheck(job.id)}
                          className="px-3 py-1 text-sm border rounded hover:bg-accent transition-colors"
                        >
                          预检查
                        </button>
                        <button
                          onClick={() => handlePublish(job.id)}
                          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                          发布
                        </button>
                      </>
                    )}

                    {job.status === "checking" && (
                      <button
                        disabled
                        className="px-3 py-1 text-sm border rounded opacity-50"
                      >
                        检查中...
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "sites" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="p-4 bg-card rounded-lg border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{site.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    类型:{" "}
                    {site.type === "qidian"
                      ? "起点"
                      : site.type === "jjwxc"
                      ? "晋江"
                      : site.type === "fanqie"
                      ? "番茄"
                      : "自定义"}
                  </p>
                  <p className="text-muted-foreground">
                    状态:{" "}
                    <span
                      className={
                        site.enabled ? "text-green-600" : "text-muted-foreground"
                      }
                    >
                      {site.enabled ? "已启用" : "未启用"}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-1 text-sm border rounded hover:bg-accent transition-colors">
                    编辑
                  </button>
                  <button
                    className={`flex-1 px-3 py-1 text-sm rounded transition-colors ${
                      site.enabled
                        ? "border border-destructive text-destructive hover:bg-destructive/10"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {site.enabled ? "禁用" : "启用"}
                  </button>
                </div>
              </div>
            ))}

            {/* Add Site Card */}
            <div className="p-4 bg-card rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="text-center text-muted-foreground">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">添加站点</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="max-w-2xl">
          <div className="space-y-6">
            {/* AI Model Config */}
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI 模型配置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    默认模型
                  </label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>OpenAI GPT-4</option>
                    <option>Claude 3.5 Sonnet</option>
                    <option>Gemini Pro</option>
                    <option>DeepSeek</option>
                    <option>Ollama (本地)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    API Key
                  </label>
                  <input
                    type="password"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="sk-..."
                  />
                </div>
              </div>
            </div>

            {/* Context Config */}
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-semibold mb-4">上下文配置</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    上下文窗口大小
                  </label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>最近 3 章</option>
                    <option>最近 6 章</option>
                    <option>最近 10 章</option>
                    <option>全书</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    默认工作流
                  </label>
                  <div className="mt-1 space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">语法纠错</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">错别字检查</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">设定一致性检查</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              保存配置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
