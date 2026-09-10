import { useEffect, useMemo, useRef, useState } from 'react';
import { fillStory, stories } from './data/finalStories.js';

const pad = (number) => String(number).padStart(2, '0');
const STORY_QUEUE_STORAGE_KEY = 'storygame-shuffle-queue-v2';
const LEGACY_STORY_QUEUE_STORAGE_KEY = 'storygame-shuffle-queue-v1';
const STORY_QUEUE_WINDOW_PREFIX = `${STORY_QUEUE_STORAGE_KEY}:`;
const STORY_CATALOG_SIGNATURE = stories.map((item) => item.id).join('|');

function readStoryQueueState() {
  try {
    const stored = window.localStorage?.getItem(STORY_QUEUE_STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      if (state?.catalogSignature === STORY_CATALOG_SIGNATURE) return state;
    }

    const legacy = window.localStorage?.getItem(LEGACY_STORY_QUEUE_STORAGE_KEY);
    if (legacy) return { lastId: JSON.parse(legacy)?.lastId, remainingIds: [] };
  } catch {
    // Fall through to the tab-scoped backup used by restricted preview browsers.
  }

  try {
    return window.name.startsWith(STORY_QUEUE_WINDOW_PREFIX)
      ? JSON.parse(window.name.slice(STORY_QUEUE_WINDOW_PREFIX.length))
      : null;
  } catch {
    return null;
  }
}

function writeStoryQueueState(state) {
  const serialized = JSON.stringify(state);
  try {
    window.localStorage?.setItem(STORY_QUEUE_STORAGE_KEY, serialized);
  } catch {
    // The tab-scoped backup below keeps refreshes stable without local storage.
  }
  window.name = `${STORY_QUEUE_WINDOW_PREFIX}${serialized}`;
}

function wrapCanvasText(context, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) { lines.push(''); continue; }
    let line = '';
    for (const character of paragraph) {
      const candidate = line + character;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function createStoryImage({ title, text, storyNumber, date }) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const width = 1080;
  const padding = 104;
  const textWidth = width - padding * 2;

  context.font = '34px ui-monospace, "PingFang SC", monospace';
  const lines = wrapCanvasText(context, text, textWidth);
  const bodyTop = 410;
  const lineHeight = 58;
  const height = Math.max(1440, bodyTop + lines.length * lineHeight + 260);
  canvas.width = width;
  canvas.height = height;

  context.fillStyle = '#f5f0e7';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#fdfbf7';
  context.fillRect(42, 36, width - 84, height - 72);

  context.fillStyle = '#57534e';
  context.font = '24px ui-monospace, "PingFang SC", monospace';
  context.textAlign = 'left';
  context.fillText(`STORY NO. ${storyNumber}`, padding, 112);
  context.textAlign = 'right';
  context.fillText(date, width - padding, 112);

  context.strokeStyle = '#aaa49a';
  context.setLineDash([12, 10]);
  context.beginPath();
  context.moveTo(padding, 158);
  context.lineTo(width - padding, 158);
  context.stroke();

  context.fillStyle = '#171614';
  context.font = '600 54px -apple-system, "PingFang SC", sans-serif';
  context.textAlign = 'center';
  context.fillText(title, width / 2, 258, textWidth);

  context.beginPath();
  context.moveTo(padding, 326);
  context.lineTo(width - padding, 326);
  context.stroke();

  context.fillStyle = '#171614';
  context.font = '34px ui-monospace, "PingFang SC", monospace';
  context.textAlign = 'left';
  context.setLineDash([]);
  lines.forEach((line, index) => context.fillText(line, padding, bodyTop + index * lineHeight));

  context.strokeStyle = '#aaa49a';
  context.setLineDash([12, 10]);
  context.beginPath();
  context.moveTo(padding, height - 156);
  context.lineTo(width - padding, height - 156);
  context.stroke();
  context.fillStyle = '#57534e';
  context.font = '24px ui-monospace, monospace';
  context.textAlign = 'center';
  context.fillText('THE END', width / 2, height - 96);
  return canvas.toDataURL('image/png');
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function TextType({ text, onComplete }) {
  const reducedMotion = usePrefersReducedMotion();
  const [length, setLength] = useState(reducedMotion ? text.length : 0);
  const completeRef = useRef(onComplete);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    if (reducedMotion) {
      setLength(text.length);
      completeRef.current?.();
      return undefined;
    }
    setLength(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setLength(index);
      if (index >= text.length) {
        window.clearInterval(timer);
        completeRef.current?.();
      }
    }, 45);
    return () => window.clearInterval(timer);
  }, [text, reducedMotion]);

  return <span>{text.slice(0, length)}<span className="cursor" aria-hidden="true">|</span></span>;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [story, setStory] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [value, setValue] = useState('');
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const inputRef = useRef(null);
  const storyQueueRef = useRef(null);

  const completedStory = useMemo(
    () => story ? fillStory(story.template, answers) : '',
    [story, answers],
  );

  useEffect(() => {
    if (screen === 'question') inputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen, questionIndex]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const updateViewportHeight = () => {
      document.documentElement.style.setProperty(
        '--viewport-height',
        `${viewport?.height ?? window.innerHeight}px`,
      );
    };
    updateViewportHeight();
    viewport?.addEventListener('resize', updateViewportHeight);
    window.addEventListener('resize', updateViewportHeight);
    return () => {
      viewport?.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  function start() {
    if (storyQueueRef.current === null) {
      try {
        const savedQueue = readStoryQueueState();
        const storiesById = new Map(stories.map((item) => [item.id, item]));
        const restored = Array.isArray(savedQueue?.remainingIds)
          ? savedQueue.remainingIds.map((id) => storiesById.get(id)).filter(Boolean)
          : [];
        const restoredIds = new Set(restored.map((item) => item.id));

        storyQueueRef.current = restored.length === restoredIds.size ? restored : [];
      } catch {
        storyQueueRef.current = [];
      }
    }

    if (storyQueueRef.current.length === 0) {
      const nextQueue = [...stories];
      for (let index = nextQueue.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [nextQueue[index], nextQueue[randomIndex]] = [nextQueue[randomIndex], nextQueue[index]];
      }

      storyQueueRef.current = nextQueue;
    }

    const selected = storyQueueRef.current.pop();
    writeStoryQueueState({
      catalogSignature: STORY_CATALOG_SIGNATURE,
      lastId: selected.id,
      remainingIds: storyQueueRef.current.map((item) => item.id),
    });
    setStory(selected);
    setAnswers({});
    setQuestionIndex(0);
    setValue('');
    setError('');
    setFinished(false);
    setSaveStatus('');
    setScreen('question');
  }

  function next(event) {
    event.preventDefault();
    const cleanValue = value.trim();
    if (!cleanValue) {
      setError('随便填一个也行。');
      inputRef.current?.focus();
      return;
    }
    const question = story.questions[questionIndex];
    if (question.key === '数字' && !/^\d+$/.test(cleanValue)) {
      setError('请填写阿拉伯数字，比如：17。');
      inputRef.current?.focus();
      return;
    }
    setAnswers((current) => ({ ...current, [question.key]: cleanValue }));
    setError('');
    if (questionIndex === story.questions.length - 1) {
      setScreen('ready');
      return;
    }
    setQuestionIndex((index) => index + 1);
    setValue('');
  }

  const question = story?.questions[questionIndex];
  const storyDate = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date());

  async function saveStoryImage() {
    const miniTool = window.xhs?.miniTool;
    if (!miniTool?.saveImageToPhotosAlbum) {
      setSaveStatus('请在小红书内打开后保存。');
      return;
    }
    setSaveStatus('正在生成图片…');
    try {
      const data = createStoryImage({
        title: story.title,
        text: completedStory,
        storyNumber: story.id.replace('story-', ''),
        date: storyDate,
      });
      const filePath = miniTool.writeTempFile
        ? (await miniTool.writeTempFile({ data })).filePath
        : data;
      await miniTool.saveImageToPhotosAlbum({ filePath });
      setSaveStatus('已保存到相册。');
    } catch (saveError) {
      setSaveStatus('保存失败，请检查相册权限后重试。');
    }
  }

  return (
    <main className={`app app--${screen}`}>
      <div className="shell">
        {screen === 'home' && (
          <section className="home screen" aria-labelledby="home-title">
            <div>
              <h1 id="home-title">编个故事</h1>
              <p>先别问为什么，随便填几个词。</p>
            </div>
            <button className="primary-button" onClick={start}>开始</button>
          </section>
        )}

        {screen === 'question' && question && (
          <section className="question screen" aria-labelledby="question-title">
            <p className="progress" aria-label={`第 ${questionIndex + 1} 题，共 ${story.questions.length} 题`}>
              {pad(questionIndex + 1)} <span>/</span> {pad(story.questions.length)}
            </p>
            <form key={questionIndex} onSubmit={next} noValidate>
              <label id="question-title" htmlFor="answer">{question.prompt}</label>
              <input
                ref={inputRef}
                id="answer"
                value={value}
                onChange={(event) => { setValue(event.target.value); if (error) setError(''); }}
                placeholder={question.placeholder}
                inputMode={question.key === '数字' ? 'numeric' : 'text'}
                pattern={question.key === '数字' ? '[0-9]*' : undefined}
                autoComplete="off"
                enterKeyHint="next"
                aria-describedby="answer-error"
                aria-invalid={Boolean(error)}
              />
              <p className="error" id="answer-error" aria-live="polite">{error}</p>
              <button className="text-button" type="submit">下一步 <span aria-hidden="true">→</span></button>
            </form>
            <p className="safety-note">请谨慎填写。内容仅在本地生成，不会上传或共享；请勿输入侵权、违法或侵犯他人权益的内容。</p>
          </section>
        )}

        {screen === 'ready' && (
          <section className="ready screen" aria-labelledby="ready-title">
            <h1 id="ready-title">都填好了。</h1>
            <button className="primary-button primary-button--wide" onClick={() => setScreen('reveal')}>生成我的故事</button>
          </section>
        )}

        {screen === 'reveal' && story && (
          <section className="reveal screen" aria-labelledby="story-title">
            <article className="receipt">
              <header className="receipt__header">
                <div className="receipt__meta">
                  <span>STORY NO. {story.id.replace('story-', '')}</span>
                  <time>{storyDate}</time>
                </div>
                <div className="receipt__rule" aria-hidden="true" />
                <h1 id="story-title">{story.title}</h1>
                <div className="receipt__rule" aria-hidden="true" />
              </header>
              <p className="story-copy" aria-live="polite">
                <TextType text={completedStory} onComplete={() => setFinished(true)} />
              </p>
              <footer className={`receipt__footer ${finished ? 'is-visible' : ''}`}>
                <div className="receipt__rule" aria-hidden="true" />
                <span>THE END</span>
              </footer>
            </article>
            {finished && (
              <div className="reveal-actions">
                <button className="primary-button save-button" onClick={saveStoryImage}>保存为图片</button>
                <button className="restart-button" onClick={start}>再编一个 <span aria-hidden="true">↗</span></button>
                <p className="save-status" aria-live="polite">{saveStatus}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
