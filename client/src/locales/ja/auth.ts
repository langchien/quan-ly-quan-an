import type { Translation } from '@/lib/i18n/types'
import type { auth as vi } from '../vi/auth'

export const auth = {
  common: {
    email: 'メールアドレス',
    password: 'パスワード',
    orContinueWith: 'または次で続行',
    bannerAlt: 'レストラン管理',
    termsPrefix: '続行することにより、当店の',
    terms: '利用規約',
    and: 'および',
    privacy: 'プライバシーポリシー',
    termsSuffix: 'に同意したものとみなされます。',
    showPassword: 'パスワードを表示',
    hidePassword: 'パスワードを非表示',
  },
  login: {
    title: 'おかえりなさい',
    subtitle: 'アカウントにログインしてください',
    forgotPassword: 'パスワードをお忘れですか？',
    submit: 'ログイン',
    submitting: 'ログイン中...',
    google: 'Googleでログイン',
    noAccount: 'アカウントをお持ちでないですか？',
    signup: '新規登録',
    success: 'ログインに成功しました！',
  },
  logout: {
    success: 'ログアウトしました！',
  },
  signup: {
    title: 'アカウント作成',
    subtitle: 'メールアドレスを入力してアカウントを作成してください',
    emailHint: 'このメールアドレスはご連絡に使用します。他者と共有されることはありません。',
    confirmPassword: 'パスワード（確認）',
    passwordHint: 'パスワードは8文字以上である必要があります。',
    submit: 'アカウントを作成',
    google: 'Googleで登録',
    hasAccount: 'すでにアカウントをお持ちですか？',
    login: 'ログイン',
  },
  guestLogin: {
    welcome: 'ようこそ！',
    description: 'テーブル番号 <b>{{number}}</b> — お名前を入力して注文を開始してください',
    nameLabel: 'お名前',
    namePlaceholder: '例: 山田 太郎',
    nameRequired: 'お名前を入力してください',
    entering: '入室中...',
    submit: 'メニューを見る',
    greeting: 'こんにちは、{{name}}様！ 👋',
    greetingDesc: 'テーブル {{number}} — ごゆっくりお楽しみください！',
  },
} satisfies Translation<typeof vi>
