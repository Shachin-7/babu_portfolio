import re

with open('/Users/sha/babu-portfolio/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

macbook_html = """    <!-- 01 — About Section (MacBook Scroll) -->
    <section id="about" class="macbook-section scroll-anchor" aria-labelledby="about-heading">
      <div class="sec-label mono mbk-label" id="about-heading">01 &mdash; About</div>

      <div class="mbk-root" id="mbk-root">
        <div class="mbk-sticky" id="mbk-sticky">

          <!-- Headline that fades out as you scroll -->
          <p class="mbk-headline" id="mbk-headline">
            Director-level product<br>and commercial leader.
          </p>

          <div class="mbk-wipe-overlay" id="mbk-wipe-overlay">
            <svg class="mbk-wipe-svg" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
              <path id="mbk-wipe-path" d="M0,12 L0,12 L100,12 L100,12 Z"></path>
            </svg>
            <div class="mbk-wipe-fill"></div>
          </div>

          <div class="mbk-split-layout">
            <div class="mbk-mac-side">
              <div class="mbk-mac-wrap" id="mbk-mac-wrap">
                <!-- MacBook device -->
                <div class="mbk-mac">
                  <!-- LID ZONE -->
                  <div class="mbk-lid-zone">
                    <!-- Static back face (closed-lid exterior) -->
                    <div class="mbk-back-face">
                      <svg class="mbk-logo" width="18" height="18" viewBox="0 0 66 65" fill="none" aria-hidden="true">
                        <path d="M8 8.05571C8 8.05571 54.9009 18.1782 57.8687 30.062C60.8365 41.9458 9.05432 57.4696 9.05432 57.4696" stroke="white" stroke-width="15" stroke-miterlimit="3.86874" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <!-- Animated screen lid (opens on scroll) -->
                    <div class="mbk-screen" id="mbk-screen">
                      <div class="mbk-bezel">
                        <div class="mbk-notch-strip"></div>
                        <div class="mbk-display">
                          <img src="assets/image.png" alt="Director Portfolio Dashboard" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                      </div>
                    </div>
                  </div><!-- /mbk-lid-zone -->

                  <div class="mbk-base">
                    <div class="mbk-above-kb"></div>
                    <div class="mbk-kb-row">
                      <div class="mbk-spk"></div>
                      <div class="mbk-keys">
                        <div class="mbk-kr"><div class="mbk-k esc">esc</div><div class="mbk-k fn">F1</div><div class="mbk-k fn">F2</div><div class="mbk-k fn">F3</div><div class="mbk-k fn">F4</div><div class="mbk-k fn">F5</div><div class="mbk-k fn">F6</div><div class="mbk-k fn">F7</div><div class="mbk-k fn">F8</div><div class="mbk-k fn">F9</div><div class="mbk-k fn">F10</div><div class="mbk-k fn">F11</div><div class="mbk-k fn">F12</div></div>
                        <div class="mbk-kr"><div class="mbk-k">`</div><div class="mbk-k">1</div><div class="mbk-k">2</div><div class="mbk-k">3</div><div class="mbk-k">4</div><div class="mbk-k">5</div><div class="mbk-k">6</div><div class="mbk-k">7</div><div class="mbk-k">8</div><div class="mbk-k">9</div><div class="mbk-k">0</div><div class="mbk-k">-</div><div class="mbk-k">=</div><div class="mbk-k wide">del</div></div>
                        <div class="mbk-kr"><div class="mbk-k wide">tab</div><div class="mbk-k">Q</div><div class="mbk-k">W</div><div class="mbk-k">E</div><div class="mbk-k">R</div><div class="mbk-k">T</div><div class="mbk-k">Y</div><div class="mbk-k">U</div><div class="mbk-k">I</div><div class="mbk-k">O</div><div class="mbk-k">P</div><div class="mbk-k">[</div><div class="mbk-k">]</div><div class="mbk-k">\\</div></div>
                        <div class="mbk-kr"><div class="mbk-k xl">caps lock</div><div class="mbk-k">A</div><div class="mbk-k">S</div><div class="mbk-k">D</div><div class="mbk-k">F</div><div class="mbk-k">G</div><div class="mbk-k">H</div><div class="mbk-k">J</div><div class="mbk-k">K</div><div class="mbk-k">L</div><div class="mbk-k">;</div><div class="mbk-k">'</div><div class="mbk-k xl">return</div></div>
                        <div class="mbk-kr"><div class="mbk-k xxl">shift</div><div class="mbk-k">Z</div><div class="mbk-k">X</div><div class="mbk-k">C</div><div class="mbk-k">V</div><div class="mbk-k">B</div><div class="mbk-k">N</div><div class="mbk-k">M</div><div class="mbk-k">,</div><div class="mbk-k">.</div><div class="mbk-k">/</div><div class="mbk-k xxl">shift</div></div>
                        <div class="mbk-kr"><div class="mbk-k">fn</div><div class="mbk-k">ctrl</div><div class="mbk-k">opt</div><div class="mbk-k wide">cmd</div><div class="mbk-k sp"></div><div class="mbk-k wide">cmd</div><div class="mbk-k">opt</div><div class="mbk-k ar">&uarr;</div><div class="mbk-k ar">&darr;</div><div class="mbk-k ar">&larr;</div><div class="mbk-k ar">&rarr;</div></div>
                      </div>
                      <div class="mbk-spk"></div>
                    </div>
                    <div class="mbk-pad"></div>
                    <div class="mbk-foot"></div>
                  </div><!-- /mbk-base -->

                </div><!-- /mbk-mac -->
              </div>
            </div><!-- /mbk-mac-side -->

            <div class="mbk-info-side" id="mbk-info-side">
              <h2 class="mbk-info-title">
                <span class="mbk-char" data-dist="-10">D</span>
                <span class="mbk-char" data-dist="-9">I</span>
                <span class="mbk-char" data-dist="-8">R</span>
                <span class="mbk-char" data-dist="-7">E</span>
                <span class="mbk-char" data-dist="-6">C</span>
                <span class="mbk-char" data-dist="-5">T</span>
                <span class="mbk-char" data-dist="-4">O</span>
                <span class="mbk-char" data-dist="-3">R</span>
                <span class="mbk-char" data-dist="-2">-</span>
                <span class="mbk-char" data-dist="-1">L</span>
                <span class="mbk-char" data-dist="0">E</span>
                <span class="mbk-char" data-dist="1">V</span>
                <span class="mbk-char" data-dist="2">E</span>
                <span class="mbk-char" data-dist="3">L</span>
                <span class="mbk-char mbk-char-space" data-dist="4"> </span>
                <span class="mbk-char" data-dist="5">P</span>
                <span class="mbk-char" data-dist="6">R</span>
                <span class="mbk-char" data-dist="7">O</span>
                <span class="mbk-char" data-dist="8">D</span>
                <span class="mbk-char" data-dist="9">U</span>
                <span class="mbk-char" data-dist="10">C</span>
                <span class="mbk-char" data-dist="11">T</span>
              </h2>
            </div><!-- /mbk-info-side -->
          </div><!-- /mbk-split-layout -->

        </div><!-- /mbk-sticky -->
      </div><!-- /mbk-root -->
    </section>"""

pattern_replace = re.compile(r'<section class="hh-after" id="about">.*?</section>', re.DOTALL)
html = pattern_replace.sub(macbook_html, html)

with open('/Users/sha/babu-portfolio/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
