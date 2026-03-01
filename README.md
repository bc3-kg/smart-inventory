# 📦 Smart Inventory (スマート在庫管理システム)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.2.0-emerald.svg)]()
[![Built with React](https://img.shields.io/badge/Engine-React_18-indigo.svg)]()

> **「モバイル・ファースト」と「デスクトップ・プレミアム」を両立した、次世代の在庫管理ソリューション。**
> 
> 現場での素早い操作感と、経営層が必要とするデータ視覚化を一つのアプリで実現。最新のWeb技術（React 18 / Tailwind CSS）を駆使し、あらゆるデバイスで最高のUXを提供します。

---

## ✨ 魅力的で使いやすいインターフェース

Smart Inventoryは単なるデータベースではありません。現場の士気を高める洗練されたデザインと、直感的な操作性を追求しています。

<p align="center">
  <img src="public/screenshots/dashboard.png" width="280" alt="ダッシュボード" title="直感的なダッシュボード" />
  <img src="public/screenshots/inventory.png" width="280" alt="在庫一覧" title="スマートな在庫一覧" />
  <img src="public/screenshots/activity.png" width="280" alt="アクティビティ履歴" title="詳細な履歴ログ" />
</p>

---

## 🚀 主な機能

### 📊 リアルタイム・在庫分析
在庫の流動性をリアルタイムでグラフ化。供給フローのトレンドを把握し、欠品リスクの予測や過剰在庫の削減に貢献します。

### 🔔 インテリジェントな在庫アラート
設定した閾値を下回ると、システムが視覚的なアラートで即座に通知。「在庫切れ」による機会損失をゼロにします。

### 📱 究極のモバイル最適化
スマホ画面でも、クリッピング（表示欠け）のない完璧なレスポンシブデザイン。倉庫内を移動しながら、片手の操作で入出庫を完結できます。

### 🌗 プレミアム・ダークモード
視認性に優れたダークモードを標準搭載。暗い倉庫内でも目が疲れにくく、SKUコードの読み取りミスを最小限に抑えます。

---

## 🛠️ テクノロジースタック

*   **フロントエンド**: React 18 / TypeScript / Vite
*   **スタイリング**: Tailwind CSS (プレミアム配色・ガラスモーフィズム採用)
*   **アニメーション**: Framer Motion
*   **多言語対応**: react-i18next (日本語/英語)
*   **データベース**: SQLite3 (堅牢なデータ整合性を保証)

---

## 📦 クイックスタート

まずは、ローカル環境でその快適さを体験してください。

1.  **リポジトリのクローン**
    ```bash
    git clone https://github.com/bc3-kg/smart-inventory.git
    cd smart-inventory
    ```

2.  **依存関係のインストール**
    ```bash
    npm install
    ```

3.  **開発サーバーの起動**
    ```bash
    npm run dev
    ```
    *ブラウザで `http://localhost:5555` を開いてください。*

---

## 📋 運用ガイド

### 大規模データへの対応
SQLiteをバックエンドに採用し、標準的なPC環境でも数万点以上のSKUを軽快に処理可能。ACID準拠により、データの破損を防ぎます。

### セキュリティ
`.env` ファイルによるセキュアな環境変数管理。オフラインでの動作も考慮した設計です。

---

## 🗺️ ロードマップ

- [ ] **クラウド同期プロトコル**: WebSocketsを利用した複数デバイス間のリアルタイム同期。
- [ ] **高度な帳票出力**: PDF形式での請求書・棚卸票の発行機能。
- [ ] **バーコード一括読取**: カメラを利用した高速な連続スキャン機能。

---

## 📜 ライセンス
本プロジェクトは **MIT ライセンス** のもとで公開されています。商用・個人を問わず、自由にご利用いただけます。

---

<p align="center">
  <i>Smart Inventory - 全ての取引に、正確さと美しさを。</i>
</p>
