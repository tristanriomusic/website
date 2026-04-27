#!/usr/bin/env python3
"""Dev server with HTTP Range Request support (needed for audio/video seeking)."""
import http.server
import os

class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        file_size = fs.st_size
        range_header = self.headers.get('Range')

        if range_header:
            try:
                ranges = range_header.strip().replace('bytes=', '').split('-')
                start = int(ranges[0]) if ranges[0] else 0
                end = int(ranges[1]) if ranges[1] else file_size - 1
                end = min(end, file_size - 1)
                length = end - start + 1

                self.send_response(206)
                self.send_header('Content-type', self.guess_type(path))
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', str(length))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()
                f.seek(start)
                return f
            except Exception:
                f.close()
                self.send_error(400, "Bad Range header")
                return None

        self.send_response(200)
        self.send_header('Content-type', self.guess_type(path))
        self.send_header('Content-Length', str(file_size))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        return f

    def log_message(self, format, *args):
        pass  # silence request logs

if __name__ == '__main__':
    os.chdir('/Users/tristanrio/VibeCode/website')
    server = http.server.HTTPServer(('', 3000), RangeHTTPRequestHandler)
    print('Serving at http://localhost:3000')
    server.serve_forever()
