"""
Seminar seed corpus: short, locator-anchored primary excerpts.

Twentieth-century items reuse the short quotations already in
src/data/canonicalCitations.ts. Public-domain items (Aristotle,
Descartes, Spinoza, Kant, Hume, Hegel) carry original-language text
plus the seminar's preferred Chinese rendering for retrieval.
"""

from __future__ import annotations

from typing import Any, Dict, List


def _doc(
    doc_id: str,
    *,
    term: str,
    title: str,
    locator: str,
    author: str,
    original: str,
    translation: str,
    edition: str,
    lang: str,
    aliases: List[str],
    kind: str = "primary",
) -> Dict[str, Any]:
    text = (
        f"{author}\n{title} {locator}\n"
        f"[{lang}]\n{original.strip()}\n"
        f"[中译 / {edition}]\n{translation.strip()}"
    )
    return {
        "id": doc_id,
        "title": f"{title} {locator}",
        "source": f"{author} · {title}",
        "kind": kind,
        "term": term,
        "locator": locator,
        "aliases": aliases,
        "original_lang": lang,
        "translation_edition": edition,
        "text": text,
    }


SEED_DOCUMENTS: List[Dict[str, Any]] = [
    _doc(
        "canon-kant-krw-b25",
        term="先验",
        title="《纯粹理性批判》(Kritik der reinen Vernunft)",
        locator="B25 / A11",
        author="Immanuel Kant",
        lang="Deutsch",
        original=(
            "Ich nenne alle Erkenntnis transzendental, die sich nicht sowohl mit "
            "Gegenständen, sondern mit unserer Erkenntnisart von Gegenständen, "
            "sofern diese a priori möglich sein soll, überhaupt beschäftigt."
        ),
        translation="我把一切不是关涉于对象，而是关涉于我们关于对象、就其应当是先天可能的而言的认识方式的认识，都称为先验的。",
        edition="邓晓芒 译 / 杨祖陶 校",
        aliases=["先验", "Transzendental", "Transcendental", "A priori", "先天"],
    ),
    _doc(
        "canon-kant-krw-a51",
        term="直观与概念",
        title="《纯粹理性批判》(Kritik der reinen Vernunft)",
        locator="A51 / B75",
        author="Immanuel Kant",
        lang="Deutsch",
        original=(
            "Gedanken ohne Inhalt sind leer, Anschauungen ohne Begriffe sind blind. "
            "Daher ist es ebenso notwendig, seine Begriffe sinnlich zu machen, als, "
            "seine Anschauungen sich verständlich zu machen."
        ),
        translation="没有内容的思想是空的，没有概念的直观是盲的。",
        edition="邓晓芒 译 / 杨祖陶 校",
        aliases=["思想无内容则空", "直观无概念则盲", "Anschauung", "Begriff"],
    ),
    _doc(
        "canon-kant-krw-b132",
        term="先验统觉",
        title="《纯粹理性批判》(Kritik der reinen Vernunft)",
        locator="B131–B132 §16",
        author="Immanuel Kant",
        lang="Deutsch",
        original=(
            "Das: Ich denke, muß alle meine Vorstellungen begleiten können; "
            "denn sonst würde etwas in mir vorgestellt werden, was gar nicht gedacht werden könnte."
        ),
        translation="‘我思’必须能够伴随我的一切表象；否则在我内部就会有根本不能被思考的表象。",
        edition="邓晓芒 译 / 杨祖陶 校",
        aliases=["先验统觉", "Apperzeption", "Ich denke", "我思必须能够伴随"],
    ),
    _doc(
        "canon-descartes-med-2",
        term="我思",
        title="《第一哲学沉思集》(Meditationes de Prima Philosophia)",
        locator="Meditatio II",
        author="René Descartes",
        lang="Latina",
        original=(
            "Ego sum, ego existo; certum est. Sed quamdiu? Nempe quamdiu cogito; "
            "nam forte etiam fieri posset, si cessarem ab omni cogitatione, ut illico totus esse desinerem."
        ),
        translation="我存在，这是确定的。但有多久？显然是只要我还在思维；若停止一切思维，我很可能立刻停止存在。",
        edition="庞景仁 译",
        aliases=["Cogito", "Cogito ergo sum", "我思故我在", "Res cogitans"],
    ),
    _doc(
        "canon-spinoza-ethica-def3",
        term="实体",
        title="《伦理学》(Ethica)",
        locator="I, Definitio III",
        author="Baruch Spinoza",
        lang="Latina",
        original=(
            "Per substantiam intelligo id, quod in se est, et per se concipitur: "
            "hoc est id, cujus conceptus non indiget conceptu alterius rei, a quo formari debeat."
        ),
        translation="按实体，我理解为在自身内并通过自身被认识的东西；它的概念并不需要借助于他物的概念来形成。",
        edition="贺麟 译",
        aliases=["Substantia", "实体", "Causa sui", "在自身内并通过自身被认识"],
    ),
    _doc(
        "canon-spinoza-ethica-prop14",
        term="神即自然",
        title="《伦理学》(Ethica)",
        locator="I, Propositio XIV",
        author="Baruch Spinoza",
        lang="Latina",
        original="Praeter Deum nulla dari neque concipi potest substantia.",
        translation="除神以外，既不能有实体，也不能设想实体。",
        edition="贺麟 译",
        aliases=["Deus sive Natura", "神即自然", "实体的唯一性"],
    ),
    _doc(
        "canon-aristotle-cat-2a11",
        term="第一本体",
        title="《范畴篇》(Categoriae)",
        locator="2a11–2a19",
        author="Aristotle",
        lang="Ἑλληνική",
        original=(
            "Οὐσία δέ ἐστιν ἡ κυριώτατά τε καὶ πρώτως καὶ μάλιστα λεγομένη, "
            "ἣ μήτε καθ᾽ ὑποκειμένου τινὸς λέγεται μήτε ἐν ὑποκειμένῳ τινί ἐστιν, "
            "οἷον ὁ τὶς ἄνθρωπος ἢ ὁ τὶς ἵππος. "
            "Δεύτεραι οὐσίαι λέγονται τὰ εἴδη, ἐν οἷς αἱ πρώτως οὐσίαι λεγόμεναι ὑπάρχουσιν."
        ),
        translation="最严格、第一义且最主要所谓的本体，既不述说一个主体，也不在一个主体之中，例如某一个人和某一匹马。第二本体则指那些种，第一本体即存在于其中。",
        edition="方书春 译 / 范畴篇标准编号",
        aliases=["Ousia", "Οὐσία", "第一本体", "第二本体", "tode ti"],
    ),
    _doc(
        "canon-aristotle-meta-zeta",
        term="本体",
        title="《形而上学》(Metaphysica)",
        locator="Zeta 1028b",
        author="Aristotle",
        lang="Ἑλληνική",
        original=(
            "Καὶ δὴ καὶ τὸ πάλαι τε καὶ νῦν καὶ ἀεὶ ζητούμενον καὶ ἀεὶ ἀπορούμενον, "
            "τί τὸ ὄν, τοῦτό ἐστι τίς ἡ οὐσία."
        ),
        translation="从古至今一直被探索、却始终令人困惑的问题：‘何为存在’，归根结底就是‘何为本体（Ousia）’。",
        edition="苗力田 译",
        aliases=["Ousia", "Οὐσία", "作为存在的存在", "To on"],
    ),
    _doc(
        "canon-hume-enquiry-4",
        term="因果性",
        title="An Enquiry Concerning Human Understanding",
        locator="§IV–V",
        author="David Hume",
        lang="English",
        original=(
            "All inferences from experience, therefore, are effects of custom, not of reasoning. "
            "There is no necessary connexion discoverable between cause and effect; "
            "we experience only constant conjunction."
        ),
        translation="一切从经验得出的推论都是习惯的结果，而非理性的结果。因与果之间并不存在可被发现的必然联结，我们所经历的只是恒常联结。",
        edition="关文运 译",
        aliases=["恒常联结", "constant conjunction", "休谟问题", "因果律"],
    ),
    _doc(
        "canon-hegel-phg-vorrede",
        term="扬弃",
        title="《精神现象学》(Phänomenologie des Geistes)",
        locator="Vorrede",
        author="G. W. F. Hegel",
        lang="Deutsch",
        original=(
            "Das Wahre ist das Ganze. Das Wahre ist aber das Ganze nur als das sich durch "
            "seine Entwicklung vollendende Wesen. Das Wahre ist nicht nur als Substanz, "
            "sondern ebensosehr als Subjekt aufzufassen."
        ),
        translation="真理是全体。但真理只有作为通过其发展而完成自身的存在才是全体。真理不仅必须被把握为实体，而且同样必须被把握为主体。",
        edition="先刚 译 / 贺麟 译本对勘",
        aliases=["Aufhebung", "扬弃", "实体即主体", "真理是全体"],
    ),
    _doc(
        "canon-wittgenstein-tlp-1",
        term="事态",
        title="《逻辑哲学论》(Tractatus Logico-Philosophicus)",
        locator="1 / 1.1",
        author="Ludwig Wittgenstein",
        lang="Deutsch",
        original="1 Die Welt ist alles, was der Fall ist.\n1.1 Die Welt ist die Gesamtheit der Tatsachen, nicht der Dinge.",
        translation="1 世界是所有发生的事情。1.1 世界是事实的总和，而不是事物的总和。",
        edition="韩林合 译",
        aliases=["Tractatus", "Sachverhalt", "世界是事实的总和"],
    ),
    _doc(
        "canon-wittgenstein-tlp-7",
        term="沉默",
        title="《逻辑哲学论》(Tractatus Logico-Philosophicus)",
        locator="7",
        author="Ludwig Wittgenstein",
        lang="Deutsch",
        original="Wovon man nicht sprechen kann, darüber muß man schweigen.",
        translation="凡是不可言说者，就必须对之保持沉默。",
        edition="韩林合 译",
        aliases=["darüber muß man schweigen", "不可言说"],
    ),
    _doc(
        "canon-heidegger-sz-9",
        term="此在",
        title="《存在与时间》(Sein und Zeit)",
        locator="§9",
        author="Martin Heidegger",
        lang="Deutsch",
        original=(
            "Das »Wesen« des Daseins liegt in seiner Existenz. "
            "Die an diesem Seienden herauszustellenden Charaktere sind daher nicht vorhandene "
            "»Eigenschaften« eines so und so »aussehenden« vorhandenen Seienden, "
            "sondern je ihm mögliche Weisen zu sein."
        ),
        translation="此在的‘本质’在于它的生存。在这个存在者身上所能展示的特征不是现成存在者的现成性质，而是它去存在的各种可能方式。",
        edition="陈嘉映 / 王庆节 译",
        aliases=["Dasein", "此在", "Existenz", "Jemeinigkeit", "向来我属性"],
    ),
    _doc(
        "canon-heidegger-sz-12",
        term="在世界之中存在",
        title="《存在与时间》(Sein und Zeit)",
        locator="§12",
        author="Martin Heidegger",
        lang="Deutsch",
        original="Das In-der-Welt-sein ist eine notwendige a priori Verfassung des Daseins.",
        translation="在世界之中存在是此在的一种先天存在建构。",
        edition="陈嘉映 / 王庆节 译",
        aliases=["In-der-Welt-sein", "Vorhandenheit", "Zuhandenheit", "现成存在", "上手"],
    ),
    _doc(
        "canon-husserl-lu6-14",
        term="意向充实",
        title="《逻辑研究》(Logische Untersuchungen)",
        locator="VI, §14–§16",
        author="Edmund Husserl",
        lang="Deutsch",
        original=(
            "Erfüllung nennen wir die Synthesis der Identifikation, "
            "in welcher die Bedeutungsintention mit der entsprechenden Anschauung zur Deckung kommt."
        ),
        translation="充实是同一性综合：空乏的意义意向与相应直观在其中达到重合。",
        edition="倪梁康 译",
        aliases=["Erfüllung", "意向充实", "Intentionale Erfüllung", "意义意向"],
    ),
    _doc(
        "canon-husserl-ideen-31",
        term="悬搁",
        title="《纯粹现象学通论》(Ideen I)",
        locator="§31–§32",
        author="Edmund Husserl",
        lang="Deutsch",
        original=(
            "Wir setzen die Generalthesis der natürlichen Einstellung außer Aktion, "
            "wir klammern alles ein, was sie in ontischer Hinsicht umfaßt."
        ),
        translation="我们把自然态度的总设定置于行动之外，将其在存在者状态方面所包含的一切放入括号。",
        edition="倪梁康 译",
        aliases=["Epoché", "悬搁", "现象学还原", "Natürliche Einstellung"],
    ),
]


def seed_documents() -> List[Dict[str, Any]]:
    return [dict(item) for item in SEED_DOCUMENTS]
