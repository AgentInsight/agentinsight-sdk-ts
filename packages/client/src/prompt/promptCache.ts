import { getGlobalLogger } from "@agentinsight-sdk/core";

import type { AgentInsightPromptClient } from "./promptClients.js";

export const DEFAULT_PROMPT_CACHE_TTL_SECONDS = 60;

class AgentInsightPromptCacheItem {
  private _expiry: number;

  constructor(
    public value: AgentInsightPromptClient,
    ttlSeconds: number,
  ) {
    this._expiry = Date.now() + ttlSeconds * 1000;
  }

  get isExpired(): boolean {
    return Date.now() > this._expiry;
  }
}
export class AgentInsightPromptCache {
  private _cache: Map<string, AgentInsightPromptCacheItem>;
  private _defaultTtlSeconds: number;
  private _refreshingKeys: Map<string, Promise<void>>;

  constructor() {
    this._cache = new Map<string, AgentInsightPromptCacheItem>();
    this._defaultTtlSeconds = DEFAULT_PROMPT_CACHE_TTL_SECONDS;
    this._refreshingKeys = new Map<string, Promise<void>>();
  }

  public getIncludingExpired(key: string): AgentInsightPromptCacheItem | null {
    return this._cache.get(key) ?? null;
  }

  public createKey(params: {
    name: string;
    version?: number;
    label?: string;
  }): string {
    const { name, version, label } = params;
    const parts = [name];

    if (version !== undefined) {
      parts.push("version:" + version.toString());
    } else if (label !== undefined) {
      parts.push("label:" + label);
    } else {
      parts.push("label:production");
    }

    return parts.join("-");
  }

  public set(
    key: string,
    value: AgentInsightPromptClient,
    ttlSeconds?: number,
  ): void {
    const effectiveTtlSeconds = ttlSeconds ?? this._defaultTtlSeconds;
    this._cache.set(
      key,
      new AgentInsightPromptCacheItem(value, effectiveTtlSeconds),
    );
  }

  public addRefreshingPromise(key: string, promise: Promise<any>): void {
    this._refreshingKeys.set(key, promise);
    promise
      .then(() => {
        this._refreshingKeys.delete(key);
      })
      .catch(() => {
        this._refreshingKeys.delete(key);
      });
  }

  public isRefreshing(key: string): boolean {
    return this._refreshingKeys.has(key);
  }

  public invalidate(promptName: string): void {
    getGlobalLogger().debug(
      "Invalidating cache keys for",
      promptName,
      this._cache.keys(),
    );

    for (const key of this._cache.keys()) {
      if (key.startsWith(promptName)) {
        this._cache.delete(key);
      }
    }
  }
}
